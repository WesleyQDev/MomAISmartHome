const path = require('path')

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') })
} catch (e) {}

const dataDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, 'data')
process.env.DB_PATH = process.env.DB_PATH || path.join(dataDir, 'smarthome.sqlite')

const connector = require('./src/index')

let deviceCache = { names: [], byRoom: {} }
let ready = false

async function init() {
  try {
    const momaiObj = (typeof momai !== 'undefined' && momai) ? momai : { storage: { storageDir: dataDir } }
    await connector.init(momaiObj)
    ready = true
    if (typeof process.send === 'function') process.send({ type: 'ready' })

    // Perform connection & device cache refresh asynchronously in background
    connector.ensureConnected(momaiObj)
      .then(() => refreshDeviceCache())
      .catch((err) => {
        if (typeof process.send === 'function') process.send({ type: 'log', message: `Background connect error: ${err.message}` })
      })
  } catch (err) {
    ready = true
    if (typeof process.send === 'function') process.send({ type: 'ready' })
  }
}

// Automatically initialize connection on worker startup
init().catch((err) => console.warn('[runtime] Auto-init error:', err))

if (typeof connector.on === 'function') {
  connector.on('state_changed', (data) => {
    if (data && data.device) {
      const dispatchEvent = (typeof momai !== 'undefined' && momai && typeof momai.sendEvent === 'function')
        ? (type, payload) => momai.sendEvent(type, payload)
        : (type, payload) => {
            if (typeof process.send === 'function') {
              process.send({ type: 'event', eventType: type, data: payload })
            }
          }

      try {
        dispatchEvent('state_changed', {
          device: data.device,
          entityId: data.entityId || data.device.id
        })
      } catch (err) {
        console.warn('[runtime] Erro ao transmitir evento state_changed:', err)
      }
    }
  })

  connector.on('connection_changed', (data) => {
    const dispatchEvent = (typeof momai !== 'undefined' && momai && typeof momai.sendEvent === 'function')
      ? (type, payload) => momai.sendEvent(type, payload)
      : (type, payload) => {
          if (typeof process.send === 'function') {
            process.send({ type: 'event', eventType: type, data: payload })
          }
        }

    try {
      dispatchEvent('connection_changed', {
        connected: Boolean(data?.connected),
        error: data?.error || null
      })
    } catch (err) {
      console.warn('[runtime] Erro ao transmitir evento connection_changed:', err)
    }
  })
}

async function refreshDeviceCache() {
  try {
    await connector.ensureConnected().catch(() => {})
    const devices = (typeof connector.syncDevices === 'function') ? await connector.syncDevices() : await connector.getDevices()
    const names = devices.map((d) => `${d.name} (${d.id})`)
    const byRoom = {}
    for (const d of devices) {
      const room = d.room || 'outros'
      if (!byRoom[room]) byRoom[room] = []
      byRoom[room].push(d.name)
    }
    deviceCache = { names, byRoom }
    return devices
  } catch {
    return []
  }
}

// Background sync interval (every 15s) to discover new devices automatically
const syncInterval = setInterval(async () => {
  if (ready) {
    await refreshDeviceCache().catch(() => {})
  }
}, 15000)
if (typeof syncInterval.unref === 'function') syncInterval.unref()

const tools = module.exports.tools = [
  {
    name: 'control_device',
    description: 'Liga, desliga ou ajusta um dispositivo inteligente (luzes, interruptores, TV, ar condicionado, etc). Use list_devices primeiro para ver os nomes disponíveis.',
    parameters: {
      type: 'object',
      required: ['device_name', 'action'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome exato ou parcial do dispositivo'
        },
        action: {
          type: 'string',
          enum: ['on', 'off', 'toggle'],
          description: 'Ação principal'
        },
        brightness: {
          type: 'number',
          description: 'Brilho (0-100) para luzes'
        },
        color: {
          type: 'string',
          description: 'Cor da luz (ex: "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "branco", "quente", "frio" ou HEX "#FF0000")'
        },
        color_temp: {
          type: 'number',
          description: 'Temperatura da cor em Kelvin (ex: 2700 para luz quente, 6500 para luz fria)'
        }
      }
    }
  },
  {
    name: 'set_light_color',
    description: 'Mude a cor, brilho ou temperatura de cor de uma lâmpada ou fita LED inteligente.',
    parameters: {
      type: 'object',
      required: ['device_name'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome da lâmpada ou grupo de luzes'
        },
        color: {
          type: 'string',
          description: 'Nome da cor (ex: "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "branco", "quente", "frio") ou formato HEX'
        },
        brightness: {
          type: 'number',
          description: 'Brilho da lâmpada de 0 a 100%'
        },
        color_temp: {
          type: 'number',
          description: 'Temperatura da cor em Kelvin (ex: 2700K a 6500K)'
        }
      }
    }
  },
  {
    name: 'control_tv_remote',
    description: 'Controle de TV e reprodutores de mídia: comandos de controle remoto (power, volume, mute, canais, navegação), alternância de entrada/fonte (HDMI 1, Netflix) e reprodução.',
    parameters: {
      type: 'object',
      required: ['device_name'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome da TV ou Media Player'
        },
        command: {
          type: 'string',
          description: 'Botão do controle remoto: power, volume_up, volume_down, mute, channel_up, channel_down, play, pause, home, back, up, down, left, right, select'
        },
        action: {
          type: 'string',
          enum: ['play', 'pause', 'stop', 'next', 'previous', 'volume_up', 'volume_down', 'mute', 'unmute', 'source', 'volume'],
          description: 'Ação de mídia'
        },
        value: {
          type: 'string',
          description: 'Valor para ação (ex: nível do volume de 0 a 100, ou nome da entrada/fonte como "HDMI 1", "Netflix")'
        }
      }
    }
  },
  {
    name: 'control_climate',
    description: 'Ajuste a temperatura alvo e o modo de operação do ar condicionado ou termostato.',
    parameters: {
      type: 'object',
      required: ['device_name'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome do ar condicionado ou termostato'
        },
        temperature: {
          type: 'number',
          description: 'Temperatura desejada em graus Celsius'
        },
        hvac_mode: {
          type: 'string',
          enum: ['cool', 'heat', 'fan_only', 'auto', 'off'],
          description: 'Modo do ar condicionado: cool (frio), heat (quente), fan_only (ventilação), auto (automático), off (desligado)'
        }
      }
    }
  },
  {
    name: 'call_ha_service',
    description: 'Executa um serviço arbitrário do Home Assistant (para automações avançadas e serviços não mapeados).',
    parameters: {
      type: 'object',
      required: ['domain', 'service'],
      properties: {
        domain: {
          type: 'string',
          description: 'Domínio do serviço (ex: "light", "media_player", "climate", "remote", "cover", "vacuum", "scene")'
        },
        service: {
          type: 'string',
          description: 'Nome do serviço (ex: "turn_on", "send_command", "select_source", "set_temperature")'
        },
        data: {
          type: 'object',
          description: 'Dados adicionais em JSON para o serviço (ex: { entity_id: "light.sala", rgb_color: [255,0,0] })'
        }
      }
    }
  },
  {
    name: 'list_devices',
    description: 'Lista todos os dispositivos inteligentes disponíveis com seus estados atuais.',
    parameters: {
      type: 'object',
      properties: {
        room: {
          type: 'string',
          description: 'Filtrar por cômodo (opcional)'
        }
      }
    }
  },
  {
    name: 'query_device',
    description: 'Obtém o estado detalhado de um dispositivo específico.',
    parameters: {
      type: 'object',
      required: ['device_name'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome do dispositivo'
        }
      }
    }
  },
  {
    name: 'open_device_control',
    description: 'Abre a interface de controle flutuante (overlay window) de um dispositivo específico (TV, controle remoto, lâmpada, ar condicionado, etc) quando o usuário pede para abrir ou exibir a tela de controle do dispositivo.',
    parameters: {
      type: 'object',
      required: ['device_name'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome do dispositivo cujo controle deve ser exibido (ex: "televisão", "luz da sala", "ar condicionado")'
        }
      }
    }
  },
  {
    name: 'close_device_control',
    description: 'Fecha a interface de controle flutuante (overlay) aberta. Use device_name para fechar o controle de um dispositivo específico; omita para fechar o controle mais recente; ou use all=true para fechar todos os controles abertos.',
    parameters: {
      type: 'object',
      required: [],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome do dispositivo cujo controle deve ser fechado (opcional). Ex: "televisão", "luz da sala".'
        },
        all: {
          type: 'boolean',
          description: 'Se true, fecha todos os controles abertos.'
        }
      }
    }
  }
]

const hbInterval = setInterval(() => {
  if (typeof process.send === 'function') {
    process.send({ type: 'heartbeat', timestamp: Date.now() })
  }
}, 30000)
if (typeof hbInterval.unref === 'function') hbInterval.unref()

init()

process.on('message', async (msg) => {
  if (msg.type === 'execute') {
    try {
      const { requestId, payload } = msg
      const { toolName, args = {}, momai } = payload || {}
      const result = await executeTool(toolName, args, momai)
      process.send({ type: 'response', requestId, result })
    } catch (err) {
      process.send({
        type: 'response',
        requestId: msg.requestId,
        result: { ok: false, error: err.message }
      })
    }
  } else if (msg.type === 'shutdown') {
    process.exit(0)
  }
})

process.on('disconnect', () => {
  process.exit(0)
})

function normalizeString(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

async function matchDevice(query, momai) {
  if (!query || typeof query !== 'string') return null
  await connector.ensureConnected(momai).catch(() => {})
  const devices = await connector.getDevices()
  if (!devices || devices.length === 0) return null

  const normQuery = normalizeString(query)
  if (!normQuery) return null

  // 1. Exact match on name or ID
  const exact = devices.find(
    (d) => normalizeString(d.name) === normQuery || normalizeString(d.id) === normQuery
  )
  if (exact) return exact

  // 2. Partial match on full query
  const partial = devices.find(
    (d) => normalizeString(d.name).includes(normQuery) || normalizeString(d.id).includes(normQuery)
  )
  if (partial) return partial

  // 3. Stopwords & Synonym expansion
  const STOP_WORDS = new Set(['da', 'do', 'das', 'dos', 'de', 'a', 'o', 'e', 'para', 'com', 'meu', 'minha', 'seu', 'sua'])
  const tokens = normQuery
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))

  if (tokens.length === 0) return null

  const SYNONYMS = {
    tv: ['televisao', 'television', 'tv', 'media_player', 'remote'],
    televisao: ['tv', 'television', 'televisao', 'media_player'],
    luz: ['lampada', 'iluminacao', 'light', 'led'],
    lampada: ['luz', 'iluminacao', 'light', 'led'],
    ar: ['clima', 'termostato', 'arcondicionado', 'climate'],
    clima: ['ar', 'termostato', 'climate']
  }

  // 4. Score-based token matching
  let bestDevice = null
  let maxScore = 0

  for (const device of devices) {
    const normName = normalizeString(device.name)
    const normId = normalizeString(device.id)
    const normRoom = normalizeString(device.room)

    let score = 0

    for (const token of tokens) {
      const matchPatterns = SYNONYMS[token] || [token]
      const matchesName = matchPatterns.some((p) => normName.includes(p))
      const matchesId = matchPatterns.some((p) => normId.includes(p))
      const matchesRoom = matchPatterns.some((p) => normRoom.includes(p))

      if (matchesName) score += 3
      if (matchesId) score += 2
      if (matchesRoom) score += 2
    }

    if (score > maxScore) {
      maxScore = score
      bestDevice = device
    }
  }

  return maxScore > 0 ? bestDevice : null
}

async function executeTool(toolName, args, momai) {
  if (typeof toolName === 'object' && toolName !== null) {
    const opts = toolName
    toolName = opts.toolName || opts.name || opts.tool
    args = opts.args || opts.parameters || opts.payload?.args || {}
    momai = opts.momai || opts.context || opts.payload?.context || momai
  }
  args = args || {}

  if (toolName !== 'connectToHomeAssistant') {
    await connector.ensureConnected(momai).catch(() => {})
  }

  switch (toolName) {
    case 'control_device': {
      if (!args.device_name || !args.action) {
        const all = await connector.getDevices().catch(() => [])
        const names = all.map((d) => d.name).join(', ')
        return {
          ok: false,
          error: `Informe device_name e action. Dispositivos disponíveis: ${names || 'Nenhum conectado'}`,
          instruction: `Erro: Informe device_name e action. Dispositivos disponíveis: ${names || 'Nenhum conectado'}`
        }
      }
      const device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices()
        const errorMsg = `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      let result
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      if (args.action === 'toggle') {
        result = await connector.toggleDevice(device.id, provider)
      } else if (args.action === 'on') {
        result = await connector.turnOnDevice(device.id, provider, {
          brightness: args.brightness,
          color: args.color,
          color_temp: args.color_temp
        })
      } else {
        result = await connector.turnOffDevice(device.id, provider)
      }
      await refreshDeviceCache()
      if (result && result.success === false) {
        const errorMsg = `Falha ao ${args.action === 'on' ? 'ligar' : 'desligar'} "${device.name}": ${result.error || 'erro desconhecido'}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      const successMsg = `Dispositivo "${device.name}" foi ${args.action === 'on' ? 'ligado' : args.action === 'off' ? 'desligado' : 'alternado'} com sucesso.`
      return { ok: true, device: device.name, action: args.action, result, instruction: successMsg }
    }

    case 'set_light_color': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name', instruction: 'Informe device_name' }
      const device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices()
        const errorMsg = `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      const result = await connector.turnOnDevice(device.id, provider, {
        color: args.color,
        brightness: args.brightness,
        color_temp: args.color_temp
      })
      await refreshDeviceCache()
      if (result && result.success === false) return { ok: false, error: result.error || 'Falha ao atualizar a luz', instruction: result.error || 'Falha ao atualizar a luz' }
      const successMsg = `Luz "${device.name}" ajustada com sucesso.`
      return { ok: true, device: device.name, result, instruction: successMsg }
    }

    case 'control_tv_remote': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name', instruction: 'Informe device_name' }
      const device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices()
        const errorMsg = `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      let result
      if (args.command) {
        result = await connector.sendRemoteCommand(device.id, args.command, { value: args.value }, provider)
      } else if (args.action) {
        result = await connector.controlMedia(device.id, args.action, args.value, provider)
      } else {
        return { ok: false, error: 'Informe command ou action', instruction: 'Informe command ou action' }
      }
      if (result && result.success === false) return { ok: false, error: result.error || 'Falha ao controlar a mídia', instruction: result.error || 'Falha ao controlar a mídia' }
      const successMsg = `Comando enviado para a TV/Media "${device.name}" com sucesso.`
      return { ok: true, device: device.name, result, instruction: successMsg }
    }

    case 'control_climate': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name', instruction: 'Informe device_name' }
      const device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices()
        const errorMsg = `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      const result = await connector.setClimate(device.id, args.temperature, args.hvac_mode, provider)
      if (result && result.success === false) return { ok: false, error: result.error || 'Falha ao controlar a climatização', instruction: result.error || 'Falha ao controlar a climatização' }
      const successMsg = `Climatização do dispositivo "${device.name}" ajustada com sucesso.`
      return { ok: true, device: device.name, result, instruction: successMsg }
    }

    case 'call_ha_service': {
      if (!args.domain || !args.service) return { ok: false, error: 'Informe domain e service', instruction: 'Informe domain e service' }
      const result = await connector.callService(args.domain, args.service, args.data || {})
      const successMsg = `Serviço ${args.domain}.${args.service} executado com sucesso.`
      return { ok: true, result, instruction: successMsg }
    }

    case 'list_devices': {
      await connector.ensureConnected(momai).catch(() => {})
      const devices = await connector.getDevices(args.connectionId)
      if ((!devices || devices.length === 0) && !connector.isConnected) {
        const conns = await connector.listConnections().catch(() => [])
        if (conns.length === 0) {
          return {
            ok: false,
            error: 'Nenhuma conexão do Home Assistant configurada. Configure a integração no painel.',
            instruction: 'Erro: Nenhuma conexão do Home Assistant configurada. Por favor, adicione sua URL e Token no painel do MomAI Smart Home.'
          }
        }
        return {
          ok: false,
          error: 'Falha ao conectar com o Home Assistant. Verifique a URL e o token de acesso.',
          instruction: 'Erro: Não foi possível se conectar ao Home Assistant. Verifique a URL, token ou status da rede.'
        }
      }
      const filtered = args.room ? devices.filter((d) => d.room?.toLowerCase() === args.room.toLowerCase()) : devices
      const list = filtered.map((d) => ({
        name: d.name,
        id: d.id,
        type: d.domain,
        room: d.room || null,
        state: d.state.on ? 'on' : 'off',
        value: d.domain === 'sensor' ? d.state.value : null,
        temperature: d.state.temperature || d.state.targetTemperature || null,
        brightness: d.state.brightness || null
      }))
      const textList = list.map((d) => `- ${d.name} (${d.type}, estado: ${d.state}${d.room ? ', cômodo: ' + d.room : ''})`).join('\n')
      return {
        ok: true,
        devices: list,
        instruction: `Aqui estão os ${list.length} dispositivos encontrados:\n${textList}\nResponda apresentando essa lista ao usuário de forma clara.`
      }
    }

    case 'query_device': {
      const device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices().catch(() => [])
        const names = all.map((d) => d.name).join(', ')
        const errorMsg = `Dispositivo "${args.device_name}" não encontrado.${names ? ' Disponíveis: ' + names : ''}`
        return { ok: false, error: errorMsg, instruction: errorMsg }
      }
      return { ok: true, device, instruction: JSON.stringify({ ok: true, device }) }
    }

    case 'open_device_control': {
      let device = await matchDevice(args.device_name, momai)
      if (!device) {
        const all = await connector.getDevices().catch(() => [])
        device = all.find((d) => d.domain === 'media_player' || d.domain === 'remote' || d.domain === 'tv')
      }
      if (!device) {
        const devName = String(args.device_name || 'TV').trim()
        device = { id: 'tv_remote', name: devName || 'Controle TV', domain: 'media_player', provider: 'homeassistant', state: 'off' }
      }

      const allDevices = await connector.getDevices().catch(() => [device])

      let overlayWidth = 380
      let overlayHeight = 520

      if (device.domain === 'media_player' || device.domain === 'remote') {
        overlayWidth = 300
        overlayHeight = 500
      } else if (device.domain === 'light') {
        overlayWidth = 280
        overlayHeight = 440
      } else if (device.domain === 'climate') {
        overlayWidth = 300
        overlayHeight = 440
      } else {
        overlayWidth = 280
        overlayHeight = 440
      }

      const overlayPayload = {
        skillId: 'momaismarthome',
        panel: 'dist/panel.js',
        panelType: 'momaismarthome-panel',
        strategy: 'replace',
        overlayId: device.id,
        overlaySize: { width: overlayWidth, height: overlayHeight },
        structuredResponse: {
          type: 'momaismarthome-panel',
          data: {
            device,
            allDevices
          }
        }
      }

      const dispatchEvent = (momai && typeof momai.sendEvent === 'function')
        ? (type, payload) => momai.sendEvent(type, payload)
        : (type, payload) => {
            if (typeof process.send === 'function') {
              process.send({ type: 'event', eventType: type, data: payload })
            }
          }

      try {
        dispatchEvent('open_overlay', overlayPayload)
      } catch (err) {
        console.warn('[runtime] Erro ao enviar sendEvent:', err)
      }

      return {
        ok: true,
        tool: 'open_device_control',
        instruction: `Interface de controle do dispositivo "${device.name}" aberta com sucesso no overlay flutuante.`
      }
    }

    case 'close_device_control': {
      const dispatchEvent = (momai && typeof momai.sendEvent === 'function')
        ? (type, payload) => momai.sendEvent(type, payload)
        : (type, payload) => {
            if (typeof process.send === 'function') {
              process.send({ type: 'event', eventType: type, data: payload })
            }
          }
      const deviceName = typeof args?.device_name === 'string' && args.device_name.trim()
        ? args.device_name.trim()
        : ''
      const all = args?.all === true
      let deviceId = ''
      if (deviceName) {
        const dev = await matchDevice(deviceName, momai).catch(() => null)
        deviceId = dev?.id || ''
      }
      try {
        dispatchEvent('close_overlay', { skillId: 'momaismarthome', device_name: deviceName, overlay_id: deviceId, all })
      } catch (err) {
        console.warn('[runtime] Erro ao enviar close_overlay:', err)
      }
      return {
        ok: true,
        tool: 'close_device_control',
        instruction: all
          ? 'Todos os controles flutuantes foram fechados.'
          : deviceName
            ? `Controle do dispositivo "${deviceName}" fechado.`
            : 'Interface de controle flutuante fechada.'
      }
    }

    case 'connectToHomeAssistant': {
      const result = await connector.connectToHomeAssistant(args.url, args.token, args.name, momai)
      await refreshDeviceCache()
      return { ok: true, ...result }
    }

    case 'getDevices': {
      await connector.ensureConnected(momai).catch(() => {})
      const devices = await connector.getDevices(args.connectionId)
      return { ok: true, devices }
    }

    case 'syncDevices': {
      await connector.ensureConnected(momai).catch(() => {})
      const devices = (typeof connector.syncDevices === 'function') ? await connector.syncDevices(args.connectionId) : await connector.getDevices(args.connectionId)
      await refreshDeviceCache()
      return { ok: true, devices }
    }

    case 'getDeviceState': {
      const device = await connector.getDeviceState(args.deviceId, args.providerType)
      return { ok: Boolean(device), device }
    }

    case 'turnOnDevice': {
      const result = await connector.turnOnDevice(args.deviceId, args.providerType, args.params || {})
      await refreshDeviceCache()
      return { ok: result?.success !== false, ...result }
    }

    case 'turnOffDevice': {
      const result = await connector.turnOffDevice(args.deviceId, args.providerType, args.params || {})
      await refreshDeviceCache()
      return { ok: result?.success !== false, ...result }
    }

    case 'toggleDevice': {
      const result = await connector.toggleDevice(args.deviceId, args.providerType)
      await refreshDeviceCache()
      return { ok: result?.success !== false, ...result }
    }

    case 'setClimate': {
      const result = await connector.setClimate(args.deviceId, args.temperature, args.hvacMode, args.providerType)
      await refreshDeviceCache()
      return { ok: result?.success !== false, ...result }
    }

    case 'listConnections': {
      const connections = await connector.listConnections()
      return { ok: true, connections }
    }

    case 'getStatus': {
      const status = await connector.getStatus(momai)
      return { ok: true, ...status }
    }

    case 'getLastConnection': {
      const result = await connector.getLastConnection(momai)
      return { ok: true, ...result }
    }

    case 'disconnectAll': {
      const result = await connector.disconnectAll(momai)
      return { ok: true, ...result }
    }

    case 'removeConnection': {
      const result = await connector.removeConnection(args.connectionId, momai)
      return { ok: true, ...result }
    }

    case 'callService': {
      const result = await connector.callService(args.domain, args.service, args.data, args.providerType || 'homeassistant')
      return { ok: true, result }
    }

    default:
      return { ok: false, error: `Unknown tool: ${toolName}` }
  }
}

module.exports.execute = executeTool
module.exports.executeTool = executeTool
