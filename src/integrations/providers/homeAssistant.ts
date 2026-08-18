const https = require('https')
const http = require('http')
const BaseProvider = require('../provider.ts')

let WebSocket
try {
  WebSocket = require('ws')
} catch (e) {
  if (typeof globalThis.WebSocket !== 'undefined') {
    WebSocket = globalThis.WebSocket
  }
}

const HA_DOMAINS = {
  light: { name: 'Light', icon: 'lightbulb', services: ['turn_on', 'turn_off', 'toggle'] },
  switch: { name: 'Switch', icon: 'switch', services: ['turn_on', 'turn_off', 'toggle'] },
  fan: { name: 'Fan', icon: 'fan', services: ['turn_on', 'turn_off', 'toggle'] },
  cover: { name: 'Cover', icon: 'curtains', services: ['open_cover', 'close_cover', 'stop_cover'] },
  lock: { name: 'Lock', icon: 'lock', services: ['lock', 'unlock'] },
  climate: { name: 'Climate', icon: 'thermostat', services: ['set_temperature', 'set_hvac_mode'] },
  sensor: { name: 'Sensor', icon: 'sensor', services: [] },
  binary_sensor: { name: 'Binary Sensor', icon: 'motion', services: [] },
  media_player: { name: 'Media Player', icon: 'tv', services: ['turn_on', 'turn_off', 'volume_set'] },
  camera: { name: 'Camera', icon: 'camera', services: ['turn_on', 'turn_off'] },
  vacuum: { name: 'Vacuum', icon: 'vacuum', services: ['start', 'stop', 'return_to_base'] },
  scene: { name: 'Scene', icon: 'palette', services: ['turn_on'] },
  automation: { name: 'Automation', icon: 'autorenew', services: ['turn_on', 'turn_off', 'toggle'] },
  alarm_control_panel: { name: 'Alarm', icon: 'security', services: ['alarm_arm_away', 'alarm_arm_home', 'alarm_disarm'] },
  sun: { name: 'Sun', icon: 'sun', services: [] },
  weather: { name: 'Weather', icon: 'cloud-sun', services: [] },
  remote: { name: 'Remote', icon: 'remote', services: ['turn_on', 'turn_off'] }
}

const EXCLUDED_DOMAINS = new Set([
  'update', 'person', 'zone', 'todo', 'tts', 'stt', 'conversation',
  'event', 'hacs', 'device_tracker', 'input_button', 'input_select',
  'select', 'number', 'input_number', 'text', 'input_text', 'datetime',
  'input_datetime', 'persistent_notification', 'button', 'diagnostics',
  'system_health'
])

// Timeout de cada request HTTP para o Home Assistant. 4000ms permite falhar
// rápido antes do timeout de fetch de 10s da interface.
const REQUEST_TIMEOUT_MS = 4000
// Falhas transitórias (rede lenta, timeout, queda breve) NÃO derrubam a conexão
// de imediato: só marcam desconectado após N falhas consecutivas (com probe de
// recuperação entre elas), para uma leve queda não virar a tela de desconectado.
const TRANSIENT_ERRORS_BEFORE_DISCONNECT = 10
// Atraso do probe de recuperação após a primeira falha transitória.
const DISCONNECT_PROBE_DELAY_MS = 5000

const COLOR_NAME_TO_RGB = {
  vermelho: [255, 0, 0],
  red: [255, 0, 0],
  verde: [0, 255, 0],
  green: [0, 255, 0],
  azul: [0, 0, 255],
  blue: [0, 0, 255],
  amarelo: [255, 255, 0],
  yellow: [255, 255, 0],
  roxo: [128, 0, 128],
  purple: [128, 0, 128],
  violeta: [238, 130, 238],
  lilas: [200, 160, 255],
  rosa: [255, 192, 203],
  pink: [255, 192, 203],
  laranja: [255, 165, 0],
  orange: [255, 165, 0],
  ciano: [0, 255, 255],
  cyan: [0, 255, 255],
  turquesa: [64, 224, 208],
  magenta: [255, 0, 255],
  branco: [255, 255, 255],
  white: [255, 255, 255],
  quente: 'warm',
  frio: 'cool'
}

function parseColor(color) {
  if (!color || typeof color !== 'string') return null
  const c = color.trim().toLowerCase()
  if (COLOR_NAME_TO_RGB[c]) {
    if (typeof COLOR_NAME_TO_RGB[c] === 'string') {
      return { color_temp_kelvin: COLOR_NAME_TO_RGB[c] === 'warm' ? 2700 : 6500 }
    }
    return { rgb_color: COLOR_NAME_TO_RGB[c] }
  }
  const hexMatch = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hexMatch) {
    return {
      rgb_color: [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ]
    }
  }
  return null
}

class HomeAssistantProvider extends BaseProvider {
  constructor(config: any = {}) {
    super(config)
    this.name = 'Home Assistant'
    this.url = config.url || process.env.HA_URL || 'http://homeassistant.local:8123'
    this.token = config.token || process.env.HA_TOKEN || ''
    this.cachedDevices = new Map()
    this.lastError = null
    this._lastConnectAttempt = 0

    this.ws = null
    this.wsConnected = false
    this.wsReconnectTimer = null
    this.wsMessageId = 0
    this._isDisconnecting = false
    this._transientErrCount = 0
    this._disconnectCheckTimer = null
  }

  _getWsUrl() {
    try {
      const parsed = new URL(this.url)
      const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${parsed.host}/api/websocket`
    } catch {
      return null
    }
  }

  _connectWebSocket() {
    if (!WebSocket) {
      console.warn('[HAProvider] WebSocket não disponível no ambiente.')
      return
    }

    const wsUrl = this._getWsUrl()
    if (!wsUrl || !this.token) return

    this._closeWebSocket(false)

    try {
      const ws = new WebSocket(wsUrl)
      this.ws = ws

      const on = (event, listener) => {
        if (typeof ws.on === 'function') {
          ws.on(event, listener)
        } else if (typeof ws.addEventListener === 'function') {
          ws.addEventListener(event, (e) => {
            const data = e.data !== undefined ? e.data : e
            listener(data)
          })
        }
      }

      on('error', (err) => {
        const msg = err?.message || String(err || '')
        if (!msg.includes('closed before the connection was established')) {
          console.warn('[HAProvider] Erro no WebSocket:', msg)
        }
      })

      on('open', () => {
        // Aguarda mensagem 'auth_required' enviada pelo servidor HA
      })

      on('message', (raw) => {
        try {
          const data = typeof raw === 'string' ? raw : (raw?.data || raw.toString())
          const msg = JSON.parse(data)
          this._handleWsMessage(msg)
        } catch (err) {
          console.warn('[HAProvider] Erro ao processar mensagem do WebSocket:', err.message)
        }
      })

      on('close', () => {
        if (this.ws !== ws) {
          // Ignora fechamento de socket anterior que já foi substituído
          return
        }
        this.wsConnected = false
        if (!this._isDisconnecting && this.token && this.url) {
          this._scheduleWsReconnect()
        }
      })
    } catch (err) {
      console.warn('[HAProvider] Erro ao instanciar WebSocket:', err.message)
      if (!this._isDisconnecting && this.token && this.url) {
        this._scheduleWsReconnect()
      }
    }
  }

  _setConnected(connected, error = null) {
    const changed = this.connected !== connected || (error && this.lastError !== error)
    this.connected = connected
    // Sucesso limpa erros anteriores (senão getStatus devolve lastError stale).
    if (connected) this.lastError = null
    if (error) this.lastError = error
    if (changed) {
      try {
        this.emit('connection_changed', { connected, error: this.lastError })
      } catch (e) {}
    }
  }

  // Falha transitória (ha_network/ha_timeout): uma leve queda de rede não deve
  // derrubar a conexão nem mostrar a tela de "desconectado" na UI. Mantém o
  // provider conectado na primeira falha, agenda um probe de recuperação e só
  // marca desconectado quando as falhas consecutivas persistem.
  _handleTransientFailure(err) {
    this._transientErrCount++
    if (this.connected && this._transientErrCount < TRANSIENT_ERRORS_BEFORE_DISCONNECT) {
      // Ainda conectado: registra o erro para diagnóstico, mas não derruba.
      if (this.lastError !== err?.message) this.lastError = err?.message || 'Falha ao comunicar com o Home Assistant'
      this._scheduleDisconnectProbe()
      return
    }
    this._transientErrCount = 0
    this._setConnected(false, err?.message || 'Falha ao comunicar com o Home Assistant')
  }

  _scheduleDisconnectProbe() {
    if (this._disconnectCheckTimer) clearTimeout(this._disconnectCheckTimer)
    this._disconnectCheckTimer = setTimeout(async () => {
      this._disconnectCheckTimer = null
      if (!this.connected || this._isDisconnecting || !this.url || !this.token) return
      try {
        await this._get('/api/config')
        // Recuperou: zera as falhas transitórias e volta ao normal.
        this._transientErrCount = 0
        if (this.lastError) {
          this.lastError = null
          try {
            this.emit('connection_changed', { connected: true, error: null })
          } catch (e) {}
        }
      } catch (err) {
        if (err?.code === 'ha_auth' || (err?.message && err.message.includes('401'))) {
          this._transientErrCount = 0
          this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
          return
        }
        this._handleTransientFailure(err)
      }
    }, DISCONNECT_PROBE_DELAY_MS)
    if (this._disconnectCheckTimer && typeof this._disconnectCheckTimer.unref === 'function') {
      this._disconnectCheckTimer.unref()
    }
  }

  _handleWsMessage(msg) {
    if (!msg || typeof msg !== 'object') return

    if (msg.type === 'auth_required') {
      if (this.ws && (this.ws.readyState === 1 || (WebSocket && this.ws.readyState === WebSocket.OPEN))) {
        this.ws.send(JSON.stringify({ type: 'auth', access_token: this.token }))
      }
      return
    }

    if (msg.type === 'auth_ok') {
      this.wsConnected = true
      const subId = ++this.wsMessageId
      if (this.ws && (this.ws.readyState === 1 || (WebSocket && this.ws.readyState === WebSocket.OPEN))) {
        this.ws.send(JSON.stringify({
          id: subId,
          type: 'subscribe_events',
          event_type: 'state_changed'
        }))
      }
      return
    }

    if (msg.type === 'auth_invalid') {
      console.warn('[HAProvider] Autenticação WebSocket recusada pelo Home Assistant:', msg.message)
      this.wsConnected = false
      this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
      return
    }

    if (msg.type === 'event' && msg.event && msg.event.event_type === 'state_changed') {
      const eventData = msg.event.data
      if (eventData && eventData.new_state && eventData.entity_id) {
        const domain = eventData.entity_id.split('.')[0]
        if (EXCLUDED_DOMAINS.has(domain) || eventData.entity_id.startsWith('sensor.backup_')) {
          return
        }
        const normalized = this._normalizeEntity(eventData.new_state)
        this.cachedDevices.set(normalized.id, normalized)
        this.emit('state_changed', { device: normalized, entityId: normalized.id })
      }
    }
  }

  _scheduleWsReconnect() {
    if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer)
    if (this._isDisconnecting || !this.url || !this.token) return

    this.wsReconnectTimer = setTimeout(() => {
      if (!this._isDisconnecting && this.url && this.token) {
        this._connectWebSocket()
      }
    }, 5000)
    if (this.wsReconnectTimer && typeof this.wsReconnectTimer.unref === 'function') {
      this.wsReconnectTimer.unref()
    }
  }

  _closeWebSocket(resetConnected = true) {
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer)
      this.wsReconnectTimer = null
    }
    if (this.ws) {
      const socket = this.ws
      this.ws = null
      try {
        if (typeof socket.on === 'function') {
          socket.on('error', () => {})
        } else if (typeof socket.addEventListener === 'function') {
          try { socket.addEventListener('error', () => {}) } catch {}
        }
        if (typeof socket.terminate === 'function') {
          socket.terminate()
        } else if (typeof socket.close === 'function') {
          socket.close()
        }
      } catch {}
    }
    if (resetConnected) {
      this.wsConnected = false
    }
  }

  _get(urlPath): Promise<any> {
    return new Promise((resolve, reject) => {
      let settled = false
      const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ''))
      const isHttps = parsedUrl.protocol === 'https:'
      const transport = isHttps ? https : http

      const req = transport.request(
        parsedUrl.toString(),
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            Pragma: 'no-cache'
          }
        },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else if (res.statusCode === 401 || res.statusCode === 403) {
              const err = new Error(`Token do Home Assistant inválido ou expirado (HTTP ${res.statusCode})`)
              err.code = 'ha_auth'
              reject(err)
            } else {
              const err = new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`)
              err.code = 'ha_http'
              reject(err)
            }
          })
        }
      )

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        const err = new Error('Tempo limite ao consultar o Home Assistant (servidor lento ou offline)')
        err.code = 'ha_timeout'
        req.destroy(err)
        reject(err)
      }, REQUEST_TIMEOUT_MS)

      req.on('error', (err) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (!err.code) err.code = 'ha_network'
        reject(err)
      })

      req.end()
    })
  }

  _post(urlPath, payload: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let settled = false
      const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ''))
      const isHttps = parsedUrl.protocol === 'https:'
      const transport = isHttps ? https : http
      const postData = JSON.stringify(payload)

      const req = transport.request(
        parsedUrl.toString(),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else if (res.statusCode === 401 || res.statusCode === 403) {
              const err = new Error(`Token do Home Assistant inválido ou expirado (HTTP ${res.statusCode})`)
              err.code = 'ha_auth'
              reject(err)
            } else {
              const err = new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`)
              err.code = 'ha_http'
              reject(err)
            }
          })
        }
      )

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        const err = new Error('Tempo limite ao chamar o Home Assistant (servidor lento ou offline)')
        err.code = 'ha_timeout'
        req.destroy(err)
        reject(err)
      }, REQUEST_TIMEOUT_MS)

      req.on('error', (err) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (!err.code) err.code = 'ha_network'
        reject(err)
      })

      req.write(postData)
      req.end()
    })
  }

  async connect() {
    this._isDisconnecting = false
    if (!this.token) {
      throw new Error('Home Assistant token is required')
    }

    // Cooldown: if we failed to connect recently, skip the network attempt
    const now = Date.now()
    if (!this.connected && this._lastConnectAttempt && (now - this._lastConnectAttempt < 15000)) {
      const friendly = this.lastError || `O servidor Home Assistant em ${this.url} está offline ou inacessível.`
      const err = new Error(friendly)
      err.code = 'ha_cooldown'
      throw err
    }
    this._lastConnectAttempt = now

    let config = null
    let lastErr = null
    try {
      config = await this._get('/api/config')
    } catch (err) {
      lastErr = err
    }
    if (!config) {
      const code = lastErr?.code
      let friendly = `Falha ao conectar ao Home Assistant em ${this.url}: ${lastErr?.message || 'sem resposta'}`
      if (code === 'ha_auth') {
        friendly = 'Token do Home Assistant inválido ou expirado (HTTP 401). Gere um novo Long-Lived Access Token em: Perfil do usuário → Segurança → Tokens de Acesso de Longa Duração.'
        // Auth inválido é o ÚNICO caso em que derruba a conexão: o token/credencial
        // realmente não funciona, então a UI deve mostrar o card de reconexão.
        this._setConnected(false, friendly)
      } else if (code === 'ha_timeout') {
        friendly = `O servidor Home Assistant em ${this.url} demorou demais para responder. Verifique se ele está ligado e acessível.`
      } else if (code === 'ha_network') {
        friendly = `Não foi possível acessar o servidor em ${this.url} (conexão recusada ou offline). Verifique se o Home Assistant está ligado, se a URL/IP está correto e se está na mesma rede.`
      }
      // Falhas de rede/timeout NÃO derrubam uma conexão já ativa: uma queda breve
      // ou um comando que dispara ensureConnected() não pode transformar o estado
      // em "desconectado" (que derrubaria a UI). Apenas registra o erro e lança;
      // a reconexão/recovery é responsabilidade do WS e do polling em background.
      if (code !== 'ha_auth') {
        this.lastError = friendly
      }
      const err = new Error(friendly)
      err.code = code || 'ha_error'
      throw err
    }
    this._transientErrCount = 0
    this._setConnected(true)
    this._connectWebSocket()
    return {
      success: true,
      message: `Conectado ao Home Assistant (${config.version || 'desconhecido'})`,
      providerName: this.name,
      version: config.version,
      locationName: config.location_name
    }
  }

  async disconnect() {
    this._isDisconnecting = true
    if (this._disconnectCheckTimer) {
      clearTimeout(this._disconnectCheckTimer)
      this._disconnectCheckTimer = null
    }
    this._transientErrCount = 0
    this._setConnected(false)
    this._closeWebSocket(true)
    this.cachedDevices.clear()
    return { success: true, message: 'Desconectado do Home Assistant' }
  }

  async listDevices() {
    if (!this.connected && this.url && this.token) {
      try {
        await this.connect()
      } catch (err) {
        this._setConnected(false, err.message)
      }
    }

    if (!this.connected) {
      // Sem conexão ativa: não devolve cache obsoleto — a UI deve avisar o usuário.
      return []
    }

    try {
      const states = await this._get('/api/states')
      const devices = states
        .filter((s) => {
          const domain = s.entity_id?.split('.')[0]
          if (!domain || EXCLUDED_DOMAINS.has(domain)) return false
          if (s.entity_id.startsWith('sensor.backup_')) return false
          return Boolean(HA_DOMAINS[domain] || s.attributes?.friendly_name)
        })
        .map((s) => this._normalizeEntity(s))

      this.cachedDevices.clear()
      devices.forEach((d) => this.cachedDevices.set(d.id, d))
      this.lastError = null
      return devices
    } catch (err) {
      // Erros ao listar dispositivos NÃO derrubam a conexão.
      // Apenas auth inválido (401) marca desconectado — os demais são
      // falhas transitórias que o SSE/WebSocket vai recuperar.
      if (err.code === 'ha_auth' || (err.message && err.message.includes('401'))) {
        this._setConnected(false, 'Token do Home Assistant inválido ou expirado (HTTP 401 Unauthorized)')
      } else {
        this.lastError = err.message
      }
      console.warn('[HAProvider] Erro ao listar dispositivos:', err.message)
      return []
    }
  }

  async getDeviceState(deviceId) {
    if (!this.connected || !deviceId) return null

    try {
      const state = await this._get(`/api/states/${encodeURIComponent(deviceId)}?refresh=${Date.now()}`)
      if (!state) return null
      const device = this._normalizeEntity(state)
      this.cachedDevices.set(device.id, device)
      return device
    } catch (err) {
      // Erros em getDeviceState NUNCA devem derrubar a conexão. A reconexão
      // é responsabilidade exclusiva de connect()/listDevices explícito.
      // Apenas loga o erro e retorna null — o chamador decide se quer retry.
      console.warn('[HAProvider] Erro ao consultar estado do dispositivo:', err.message)
      return null
    }
  }

  async turnOn(deviceId, params: any = {}) {
    const device = this.cachedDevices.get(deviceId)
    const domain = deviceId.split('.')[0]

    const haPayload: any = { entity_id: deviceId }
    let servicePath = `/api/services/${domain}/turn_on`
    if (domain === 'lock') {
      servicePath = `/api/services/lock/unlock`
    } else if (domain === 'cover') {
      servicePath = `/api/services/cover/open_cover`
    }

    if (domain === 'light') {
      if (params.brightness !== undefined && params.brightness !== null) {
        haPayload.brightness_pct = Math.max(0, Math.min(100, Number(params.brightness)))
      }
      if (params.color) {
        const parsed = parseColor(params.color)
        if (parsed) Object.assign(haPayload, parsed)
      }
      if (params.color_temp) {
        const kelvin = Number(params.color_temp)
        // Valida/clampa: NaN ou fora de faixa não pode ir pro HA (B8).
        if (Number.isFinite(kelvin)) {
          haPayload.color_temp_kelvin = Math.max(2000, Math.min(6500, kelvin))
        }
      }
    }

    for (const key of Object.keys(params)) {
      if (!['brightness', 'color', 'color_temp'].includes(key)) {
        haPayload[key] = params[key]
      }
    }

    try {
      await this._post(servicePath, haPayload)
      if (device && device.state) {
        device.state.on = true
        if (domain === 'cover') device.state.isOpen = true
        if (domain === 'lock') device.state.locked = false
      }
      if (device) {
        this.cachedDevices.set(deviceId, device)
        if (!this.wsConnected) {
          this.emit('state_changed', { device, entityId: deviceId })
        }
      }
      return { success: true, deviceId, action: 'turnOn', payload: haPayload }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async turnOff(deviceId, params = {}) {
    const device = this.cachedDevices.get(deviceId)
    const domain = deviceId.split('.')[0]
    let servicePath = `/api/services/${domain}/turn_off`
    if (domain === 'lock') {
      servicePath = `/api/services/lock/lock`
    } else if (domain === 'cover') {
      servicePath = `/api/services/cover/close_cover`
    }
    try {
      await this._post(servicePath, { entity_id: deviceId, ...params })
      if (device && device.state) {
        device.state.on = false
        if (domain === 'cover') device.state.isOpen = false
        if (domain === 'lock') device.state.locked = true
      }
      if (device) {
        this.cachedDevices.set(deviceId, device)
        if (!this.wsConnected) {
          this.emit('state_changed', { device, entityId: deviceId })
        }
      }
      return { success: true, deviceId, action: 'turnOff' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async toggle(deviceId) {
    const domain = deviceId.split('.')[0]
    const device = this.cachedDevices.get(deviceId)
    const toggleDomains = new Set(['light', 'switch', 'fan', 'automation', 'input_boolean'])
    if (toggleDomains.has(domain)) {
      try {
        await this._post(`/api/services/${domain}/toggle`, { entity_id: deviceId })
        return { success: true, deviceId, action: 'toggle' }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }
    return device?.state?.on ? this.turnOff(deviceId) : this.turnOn(deviceId)
  }

  async sendRemoteCommand(deviceId, command, extra: any = {}) {
    const domain = deviceId.split('.')[0]
    const cmdUpper = String(Array.isArray(command) ? command[0] : command).toUpperCase().trim()

    // Encontrar entidades de TV relacionadas (ex: media_player.tv_thucos_2, remote.tv_thucos)
    let relatedEntities = []
    try {
      const baseName = deviceId.split('.')[1].replace(/_\d+$/, '')
      const states = await this._get('/api/states')
      relatedEntities = states.filter(s => {
        const id = s.entity_id
        return (id.startsWith('media_player.') || id.startsWith('remote.')) && id.includes(baseName)
      })
    } catch (e) {}

    const mediaPlayers = relatedEntities.filter(s => s.entity_id.startsWith('media_player.'))
    const remotes = relatedEntities.filter(s => s.entity_id.startsWith('remote.'))

    if (cmdUpper === 'YOUTUBE' || cmdUpper === 'NETFLIX') {
      const appId = cmdUpper === 'YOUTUBE' ? 'com.google.android.youtube.tv' : 'com.netflix.ninja'
      let executed = false
      let lastErr = null

      for (const mp of mediaPlayers) {
        try {
          await this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: appId })
          executed = true
        } catch (e) { lastErr = e }
      }
      for (const rm of remotes) {
        try {
          await this._post('/api/services/remote/turn_on', { entity_id: rm.entity_id, activity: appId })
          executed = true
        } catch (e) { lastErr = e }
      }

      // Só reporta sucesso se ao menos uma chamada REAL executou; senão erra
      // com a última mensagem em vez de cair no fallback genérico (M4).
      if (executed) return { success: true }
      const msg = lastErr?.message || 'nenhuma entidade de TV/remote correspondente'
      console.warn('[HAProvider] Falha ao abrir o app via media/remote:', msg)
      return { success: false, error: `Não foi possível abrir ${cmdUpper}: ${msg}` }
    }

    const inputActivityMap = {
      'HDMI 1': 'passthrough://media_1',
      'HDMI1': 'passthrough://media_1',
      'HDMI 2': 'passthrough://media_2',
      'HDMI2': 'passthrough://media_2',
      'HDMI 3': 'passthrough://media_3',
      'HDMI3': 'passthrough://media_3',
      'TV': 'passthrough://media_0',
      'AV': 'passthrough://media_av'
    }

    const isTvCmd = cmdUpper === 'TV' || cmdUpper === 'TV1' || cmdUpper === 'LIVE TV' || cmdUpper === 'TV AO VIVO'
    const isInputCmd = Boolean(inputActivityMap[cmdUpper]) || isTvCmd

    if (isInputCmd) {
      const act = inputActivityMap[cmdUpper] || 'passthrough://media_0'
      let inputExecuted = false
      let inputLastErr = null

      // 1. Tentar media_player.select_source com o nome da entrada fornecido
      for (const mp of mediaPlayers) {
        try {
          await this._post('/api/services/media_player/select_source', { entity_id: mp.entity_id, source: command })
          inputExecuted = true
        } catch (e) { inputLastErr = e }

        // Se for comando de TV, procurar termos equivalentes no source_list oficial da TV no HA
        if (isTvCmd && Array.isArray(mp.attributes?.source_list)) {
          const matchedSource = mp.attributes.source_list.find((s) => {
            const l = String(s).toLowerCase().trim()
            return l === 'tv' || l === 'live tv' || l === 'tv ao vivo' || l === 'dtv' || l === 'tv/dtv' || l === 'antenna' || l === 'tuner' || l === 'sintonizador'
          })
          if (matchedSource) {
            try {
              await this._post('/api/services/media_player/select_source', { entity_id: mp.entity_id, source: matchedSource })
              inputExecuted = true
            } catch (e) { inputLastErr = e }
          }
        }
      }

      // 2. Tentar media_player.play_media com a URI passthrough e com.tcl.tv
      for (const mp of mediaPlayers) {
        try {
          await this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: act })
          inputExecuted = true
        } catch (e) { inputLastErr = e }
        if (isTvCmd) {
          try {
            await this._post('/api/services/media_player/play_media', { entity_id: mp.entity_id, media_content_type: 'app', media_content_id: 'com.tcl.tv' })
            inputExecuted = true
          } catch (e) { inputLastErr = e }
        }
      }

      // 3. Tentar remote.turn_on com a activity passthrough no controle remoto
      for (const rm of remotes) {
        try {
          await this._post('/api/services/remote/turn_on', { entity_id: rm.entity_id, activity: act })
          inputExecuted = true
        } catch (e) { inputLastErr = e }

        // 4. Tentar remote.send_command com comandos universais de entrada de TV
        for (const inputCmd of ['TV_INPUT', 'INPUT', 'TV', 'LIVE_TV']) {
          try {
            await this._post('/api/services/remote/send_command', { entity_id: rm.entity_id, command: [inputCmd] })
            inputExecuted = true
          } catch (e) { inputLastErr = e }
        }
      }

      // Só reporta sucesso se ao menos uma chamada REAL executou (M4).
      if (inputExecuted) return { success: true }
      const inputMsg = inputLastErr?.message || 'nenhuma entidade de TV/remote correspondente'
      console.warn('[HAProvider] Falha ao trocar entrada da TV:', inputMsg)
      return { success: false, error: `Não foi possível alternar para ${cmdUpper}: ${inputMsg}` }
    }

    if (domain === 'remote') {
      // B9: send_command só é válido para entidades do domínio remote. Se um
      // media_player chegar aqui, use o remote correspondente ou falhe claro.
      if (typeof deviceId !== 'string' || !deviceId.startsWith('remote.')) {
        return { success: false, error: 'Comando de controle remoto requer uma entidade do domínio remote (ex.: remote.tv_sala).' }
      }
      const remoteCmdMap = {
        UP: 'DPAD_UP',
        DOWN: 'DPAD_DOWN',
        LEFT: 'DPAD_LEFT',
        RIGHT: 'DPAD_RIGHT',
        ENTER: 'DPAD_CENTER',
        OK: 'DPAD_CENTER',
        PLAY: 'MEDIA_PLAY',
        PAUSE: 'MEDIA_PAUSE',
        PLAY_PAUSE: 'MEDIA_PLAY_PAUSE',
        PREV: 'MEDIA_PREVIOUS',
        PREVIOUS: 'MEDIA_PREVIOUS',
        NEXT: 'MEDIA_NEXT',
        VOLUME_UP: 'VOLUME_UP',
        VOL_UP: 'VOLUME_UP',
        VOLUME_DOWN: 'VOLUME_DOWN',
        VOL_DOWN: 'VOLUME_DOWN',
        MUTE: 'MUTE',
        BACK: 'BACK',
        HOME: 'HOME',
        TV: 'TV_INPUT',
        AV: 'TV_INPUT',
        INPUT: 'TV_INPUT',
        TV_INPUT: 'TV_INPUT'
      }

      const targetCmd = remoteCmdMap[cmdUpper] || cmdUpper
      const commandArray = [targetCmd]
      return this._post('/api/services/remote/send_command', { entity_id: deviceId, command: commandArray, ...extra })
    }

    // 1. YouTube e Netflix via select_source ou play_media (Android TV App ID / Deep Link)
    if (cmdUpper === 'YOUTUBE' || cmdUpper === 'NETFLIX') {
      const sourceName = cmdUpper === 'YOUTUBE' ? 'YouTube' : 'Netflix'
      const appId = cmdUpper === 'YOUTUBE' ? 'com.google.android.youtube.tv' : 'com.netflix.ninja'

      try {
        const res = await this.controlMedia(deviceId, 'source', sourceName)
        if (res?.success !== false) return res
      } catch (e) {}

      try {
        const res = await this._post('/api/services/media_player/play_media', {
          entity_id: deviceId,
          media_content_type: 'app',
          media_content_id: appId
        })
        if (res?.success !== false) return res
      } catch (e) {}

      return this._post('/api/services/media_player/play_media', {
        entity_id: deviceId,
        media_content_type: 'url',
        media_content_id: cmdUpper === 'YOUTUBE' ? 'https://www.youtube.com' : 'https://www.netflix.com'
      })
    }

    // 2. Comandos de navegação / ação em media_player
    if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'OK', 'BACK', 'HOME', 'MENU'].includes(cmdUpper)) {
      try {
        return await this._post('/api/services/media_player/play_media', {
          entity_id: deviceId,
          media_content_type: 'action',
          media_content_id: cmdUpper === 'ENTER' ? 'DPAD_CENTER' : (cmdUpper === 'UP' ? 'DPAD_UP' : (cmdUpper === 'DOWN' ? 'DPAD_DOWN' : (cmdUpper === 'LEFT' ? 'DPAD_LEFT' : (cmdUpper === 'RIGHT' ? 'DPAD_RIGHT' : cmdUpper))))
        })
      } catch (e) {}
    }

    return this.controlMedia(deviceId, command, extra.value)
  }

  async controlMedia(deviceId, action, value) {
    const domain = deviceId.split('.')[0]
    const serviceMap = {
      play: 'media_play',
      pause: 'media_pause',
      stop: 'media_stop',
      next: 'media_next_track',
      previous: 'media_previous_track',
      volume_up: 'volume_up',
      volume_down: 'volume_down'
    }

    if (action === 'volume' && value !== undefined) {
      const level = Number(value) / 100
      if (!Number.isFinite(level)) {
        return { success: false, error: `Nível de volume inválido: ${value}` }
      }
      return this._post('/api/services/media_player/volume_set', {
        entity_id: deviceId,
        volume_level: Math.max(0, Math.min(1, level))
      })
    }
    if (action === 'mute') {
      return this._post('/api/services/media_player/volume_mute', { entity_id: deviceId, is_volume_muted: true })
    }
    if (action === 'unmute') {
      return this._post('/api/services/media_player/volume_mute', { entity_id: deviceId, is_volume_muted: false })
    }
    if (action === 'source' && value) {
      return this._post('/api/services/media_player/select_source', { entity_id: deviceId, source: value })
    }

    const service = serviceMap[action] || action
    return this._post(`/api/services/${domain}/${service}`, { entity_id: deviceId })
  }

  async setClimate(deviceId, temperature, hvacMode) {
    const results = []
    if (temperature !== undefined && temperature !== null) {
      const tempNum = Number(temperature)
      if (!Number.isFinite(tempNum)) {
        return { success: false, error: `Temperatura inválida: ${temperature}` }
      }
      const res = await this._post('/api/services/climate/set_temperature', {
        entity_id: deviceId,
        temperature: tempNum
      })
      results.push(res)
    }
    if (hvacMode) {
      const res = await this._post('/api/services/climate/set_hvac_mode', {
        entity_id: deviceId,
        hvac_mode: hvacMode
      })
      results.push(res)
    }
    return { success: true, results }
  }

  async callService(domain, service, data = {}) {
    // Fail-fast: nunca tenta reconectar no call path — a reconexão é feita
    // em background pelo sync/polling. Evita travar o worker por 4-8s com
    // DNS lookups que falham (homeassistant.local) quando HA está offline.
    if (!this.connected) throw new Error('Home Assistant offline ou desconectado')
    // Segurança: valida domain/service para impedir path traversal — valores
    // como "../config" ou "config" normalizariam para endpoints arbitrários.
    // Domínios/serviços do HA são [a-z0-9_] (ex.: light.turn_on).
    const SAFE_PATH_RE = /^[a-z_][a-z0-9_]*$/
    if (typeof domain !== 'string' || !SAFE_PATH_RE.test(domain)) {
      throw new Error('Domínio inválido. Use apenas letras minúsculas e underscore (ex.: light, media_player).')
    }
    if (typeof service !== 'string' || !SAFE_PATH_RE.test(service)) {
      throw new Error('Serviço inválido. Use apenas letras minúsculas e underscore (ex.: turn_on, select_source).')
    }
    return this._post(`/api/services/${domain}/${service}`, data)
  }

  _normalizeEntity(state) {
    const domain = state.entity_id?.split('.')[0]
    const domainInfo = HA_DOMAINS[domain] || { name: domain, icon: 'help' }
    const attrs = state.attributes || {}
    const rawState = String(state.state || '').toLowerCase().trim()

    let isOn = false
    if (domain === 'light' || domain === 'switch' || domain === 'fan' || domain === 'automation' || domain === 'remote' || domain === 'input_boolean') {
      isOn = rawState === 'on' || rawState === 'home' || rawState === 'active'
    } else if (domain === 'climate') {
      isOn = rawState !== 'off' && rawState !== 'unavailable' && rawState !== 'unknown'
    } else if (domain === 'media_player') {
      isOn = rawState !== 'off' && rawState !== 'standby' && rawState !== 'unavailable' && rawState !== 'unknown'
    } else if (domain === 'lock') {
      isOn = rawState === 'unlocked' || rawState === 'unlocking'
    } else if (domain === 'cover') {
      isOn = rawState === 'open' || rawState === 'opening'
    } else if (domain === 'vacuum') {
      isOn = rawState === 'cleaning' || rawState === 'returning' || rawState === 'on'
    } else if (domain === 'sensor' || domain === 'sun' || domain === 'weather') {
      isOn = false
    } else {
      isOn = rawState === 'on' || rawState === 'home' || rawState === 'open' || rawState === 'playing' || rawState === 'active' || (rawState !== 'off' && rawState !== 'unavailable' && rawState !== 'unknown' && rawState !== 'standby' && rawState !== 'closed' && rawState !== 'locked')
    }

    const normalized: any = {
      id: state.entity_id,
      name: attrs.friendly_name || state.entity_id,
      type: domainInfo.name,
      domain,
      icon: domainInfo.icon,
      provider: this.name,
      room: attrs.area_id || attrs.area || '',
      online: rawState !== 'unavailable' && rawState !== 'unknown',
      state: {
        on: isOn,
        rawState: state.state
      },
      attributes: {
        deviceClass: attrs.device_class || null,
        unitOfMeasurement: attrs.unit_of_measurement || null,
        haIcon: attrs.icon || null
      }
    }

    if (domain === 'light') {
      normalized.state.brightness = (attrs.brightness !== undefined && attrs.brightness !== null)
        ? Math.round((attrs.brightness / 255) * 100)
        : null
      normalized.state.colorTemp = attrs.color_temp || null
      normalized.state.colorTempKelvin = attrs.color_temp_kelvin || (attrs.color_temp ? Math.round(1000000 / attrs.color_temp) : null)

      let rgb = null
      if (Array.isArray(attrs.rgb_color) && attrs.rgb_color.length === 3) {
        rgb = attrs.rgb_color
      }
      normalized.state.rgbColor = rgb
      normalized.state.hexColor = rgb
        ? `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
        : null

      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'climate') {
      normalized.state.temperature = attrs.current_temperature ?? null
      normalized.state.targetTemperature = attrs.temperature ?? null
      normalized.state.hvacMode = state.state
      normalized.state.hvacModes = attrs.hvac_modes || []
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'cover') {
      normalized.state.position = attrs.current_position ?? null
      normalized.state.isOpen = rawState === 'open' || rawState === 'opening'
    } else if (domain === 'sensor' || domain === 'binary_sensor') {
      normalized.state.value = state.state
      normalized.state.unit = attrs.unit_of_measurement || ''
    } else if (domain === 'lock') {
      normalized.state.locked = rawState === 'locked'
    } else if (domain === 'media_player') {
      normalized.state.volume = (attrs.volume_level !== undefined && attrs.volume_level !== null)
        ? attrs.volume_level
        : null
      normalized.state.isMuted = Boolean(attrs.is_volume_muted)
      normalized.state.source = attrs.source || null
      normalized.state.mediaTitle = attrs.media_title || attrs.media_content_id || null
      normalized.state.mediaArtist = attrs.media_artist || null
      normalized.state.isPlaying = rawState === 'playing'
      normalized.attributes.source_list = attrs.source_list || []
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'sun') {
      normalized.state.rawState = state.state
      normalized.state.elevation = attrs.elevation ?? null
      normalized.state.azimuth = attrs.azimuth ?? null
      normalized.state.rising = attrs.rising ?? false
      normalized.attributes.next_rising = attrs.next_rising || null
      normalized.attributes.next_setting = attrs.next_setting || null
      normalized.attributes.next_dawn = attrs.next_dawn || null
      normalized.attributes.next_dusk = attrs.next_dusk || null
    } else if (domain === 'weather') {
      normalized.state.rawState = state.state
      normalized.state.temperature = attrs.temperature ?? null
      normalized.state.temperatureUnit = attrs.temperature_unit || '°C'
      normalized.state.humidity = attrs.humidity ?? null
      normalized.state.pressure = attrs.pressure ?? null
      normalized.state.pressureUnit = attrs.pressure_unit || 'hPa'
      normalized.state.windSpeed = attrs.wind_speed ?? null
      normalized.state.windSpeedUnit = attrs.wind_speed_unit || 'km/h'
    }

    return normalized
  }
}

module.exports = HomeAssistantProvider

