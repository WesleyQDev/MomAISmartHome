const https = require('https')
const http = require('http')
const BaseProvider = require('../provider')

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
  constructor(config = {}) {
    super(config)
    this.name = 'Home Assistant'
    this.url = config.url || process.env.HA_URL || 'http://homeassistant.local:8123'
    this.token = config.token || process.env.HA_TOKEN || ''
    this.cachedDevices = new Map()
  }

  _get(urlPath) {
    return new Promise((resolve, reject) => {
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
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else {
              reject(new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`))
            }
          })
        }
      )
      req.setTimeout(15000, () => req.destroy(new Error('Tempo limite ao consultar o Home Assistant')))
      req.on('error', reject)
      req.end()
    })
  }

  _post(urlPath, payload = {}) {
    return new Promise((resolve, reject) => {
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
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else {
              reject(new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`))
            }
          })
        }
      )
      req.setTimeout(15000, () => req.destroy(new Error('Tempo limite ao chamar o Home Assistant')))
      req.on('error', reject)
      req.write(postData)
      req.end()
    })
  }

  async connect() {
    if (!this.token) {
      throw new Error('Home Assistant token is required')
    }
    try {
      const config = await this._get('/api/config')
      this.connected = true
      return {
        success: true,
        message: `Conectado ao Home Assistant (${config.version || 'desconhecido'})`,
        providerName: this.name,
        version: config.version,
        locationName: config.location_name
      }
    } catch (err) {
      this.connected = false
      throw new Error(`Falha ao conectar ao Home Assistant em ${this.url}: ${err.message}`)
    }
  }

  async disconnect() {
    this.connected = false
    this.cachedDevices.clear()
    return { success: true, message: 'Desconectado do Home Assistant' }
  }

  async listDevices() {
    if (!this.connected) return []

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
      return devices
    } catch (err) {
      console.warn('[HAProvider] Erro ao listar dispositivos:', err.message)
      return Array.from(this.cachedDevices.values())
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
      console.warn('[HAProvider] Erro ao consultar estado do dispositivo:', err.message)
      return null
    }
  }

  async turnOn(deviceId, params = {}) {
    const device = this.cachedDevices.get(deviceId)
    const domain = deviceId.split('.')[0]

    const haPayload = { entity_id: deviceId }
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
        haPayload.color_temp_kelvin = Number(params.color_temp)
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
      if (device) this.cachedDevices.set(deviceId, device)
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
      if (device) this.cachedDevices.set(deviceId, device)
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

  async sendRemoteCommand(deviceId, command, extra = {}) {
    const domain = deviceId.split('.')[0]
    if (domain === 'remote') {
      return this._post('/api/services/remote/send_command', { entity_id: deviceId, command, ...extra })
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
      return this._post('/api/services/media_player/volume_set', {
        entity_id: deviceId,
        volume_level: Math.max(0, Math.min(1, Number(value) / 100))
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
      const res = await this._post('/api/services/climate/set_temperature', {
        entity_id: deviceId,
        temperature: Number(temperature)
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
    if (!this.connected) throw new Error('Not connected to Home Assistant')
    return this._post(`/api/services/${domain}/${service}`, data)
  }

  async getHistory(entityId, startTime) {
    const start = startTime || new Date(Date.now() - 86400000).toISOString()
    return this._get(`/api/history/period/${start}?filter_entity_id=${entityId}`)
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

    const normalized = {
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
      normalized.state.brightness = attrs.brightness ? Math.round((attrs.brightness / 255) * 100) : null
      normalized.state.colorTemp = attrs.color_temp || null
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'climate') {
      normalized.state.temperature = attrs.current_temperature || null
      normalized.state.targetTemperature = attrs.temperature || null
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
      normalized.state.volume = attrs.volume_level ?? null
      normalized.state.source = attrs.source || null
      normalized.state.mediaTitle = attrs.media_title || null
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
