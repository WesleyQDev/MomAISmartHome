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
    await connector.init()
    ready = true
    if (typeof process.send === 'function') process.send({ type: 'ready' })
  } catch (err) {
    if (typeof process.send === 'function') process.send({ type: 'log', message: `Init error: ${err.message}` })
  }
}

async function refreshDeviceCache() {
  try {
    await connector.init()
    const devices = await connector.getDevices()
    const names = devices.map((d) => `${d.name} (${d.id})`)
    const byRoom = {}
    for (const d of devices) {
      const room = d.room || 'outros'
      if (!byRoom[room]) byRoom[room] = []
      byRoom[room].push(d.name)
    }
    deviceCache = { names, byRoom }
  } catch {}
}

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
  }
]

setInterval(() => {
  if (typeof process.send === 'function') {
    process.send({ type: 'heartbeat', timestamp: Date.now() })
  }
}, 30000)

init()

process.on('message', async (msg) => {
  if (msg.type === 'execute') {
    try {
      const { requestId, payload } = msg
      const { toolName, args = {} } = payload || {}
      const result = await executeTool(toolName, args)
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

async function matchDevice(query) {
  if (!query || typeof query !== 'string') return null
  await connector.init()
  const devices = await connector.getDevices()
  const q = query.toLowerCase().trim()
  if (!q) return null
  const exact = devices.find((d) => d.name.toLowerCase() === q)
  if (exact) return exact
  const partial = devices.find((d) => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
  if (partial) return partial
  const words = q.split(/\s+/).filter((w) => !['da', 'do', 'das', 'dos', 'de', 'a', 'o', 'e', 'para', 'com'].includes(w))
  const best = devices.find((d) => words.some((w) => w.length > 2 && d.name.toLowerCase().includes(w)))
  return best || null
}

async function executeTool(toolName, args) {
  switch (toolName) {
    case 'control_device': {
      if (!args.device_name || !args.action) {
        const all = await connector.getDevices().catch(() => [])
        const names = all.map((d) => d.name).join(', ')
        return { ok: false, error: `Informe device_name e action. Dispositivos disponíveis: ${names || 'Nenhum conectado'}` }
      }
      await connector.init()
      const device = await matchDevice(args.device_name)
      if (!device) {
        const all = await connector.getDevices()
        return { ok: false, error: `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}` }
      }
      let result
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      if (args.action === 'on' || args.action === 'toggle' || args.color || args.brightness !== undefined) {
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
        return { ok: false, error: `Falha ao ${args.action === 'on' ? 'ligar' : 'desligar'} "${device.name}": ${result.error || 'erro desconhecido'}` }
      }
      return { ok: true, device: device.name, action: args.action, result }
    }

    case 'set_light_color': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name' }
      await connector.init()
      const device = await matchDevice(args.device_name)
      if (!device) {
        const all = await connector.getDevices()
        return { ok: false, error: `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}` }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      const result = await connector.turnOnDevice(device.id, provider, {
        color: args.color,
        brightness: args.brightness,
        color_temp: args.color_temp
      })
      await refreshDeviceCache()
      return { ok: true, device: device.name, result }
    }

    case 'control_tv_remote': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name' }
      await connector.init()
      const device = await matchDevice(args.device_name)
      if (!device) {
        const all = await connector.getDevices()
        return { ok: false, error: `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}` }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      let result
      if (args.command) {
        result = await connector.sendRemoteCommand(device.id, args.command, { value: args.value }, provider)
      } else if (args.action) {
        result = await connector.controlMedia(device.id, args.action, args.value, provider)
      } else {
        return { ok: false, error: 'Informe command ou action' }
      }
      return { ok: true, device: device.name, result }
    }

    case 'control_climate': {
      if (!args.device_name) return { ok: false, error: 'Informe device_name' }
      await connector.init()
      const device = await matchDevice(args.device_name)
      if (!device) {
        const all = await connector.getDevices()
        return { ok: false, error: `Dispositivo "${args.device_name}" não encontrado. Disponíveis: ${all.map((d) => d.name).join(', ')}` }
      }
      const provider = device.provider?.toLowerCase().replace(/\s+/g, '')
      const result = await connector.setClimate(device.id, args.temperature, args.hvac_mode, provider)
      return { ok: true, device: device.name, result }
    }

    case 'call_ha_service': {
      if (!args.domain || !args.service) return { ok: false, error: 'Informe domain e service' }
      await connector.init()
      const result = await connector.callService(args.domain, args.service, args.data || {})
      return { ok: true, result }
    }

    case 'list_devices': {
      await connector.init()
      const devices = await connector.getDevices(args.connectionId)
      const filtered = args.room ? devices.filter((d) => d.room?.toLowerCase() === args.room.toLowerCase()) : devices
      return {
        ok: true,
        devices: filtered.map((d) => ({
          name: d.name,
          id: d.id,
          type: d.domain,
          room: d.room || null,
          state: d.state.on ? 'on' : 'off',
          value: d.domain === 'sensor' ? d.state.value : null,
          temperature: d.state.temperature || d.state.targetTemperature || null,
          brightness: d.state.brightness || null
        }))
      }
    }

    case 'query_device': {
      await connector.init()
      const device = await matchDevice(args.device_name)
      if (!device) return { ok: false, error: `Dispositivo "${args.device_name}" não encontrado` }
      return { ok: true, device }
    }

    case 'connectToHomeAssistant': {
      const result = await connector.connectToHomeAssistant(args.url, args.token, args.name)
      await refreshDeviceCache()
      return { ok: true, ...result }
    }

    case 'getDevices': {
      const devices = await connector.getDevices(args.connectionId)
      return { ok: true, devices }
    }

    case 'turnOnDevice': {
      const result = await connector.turnOnDevice(args.deviceId, args.providerType)
      await refreshDeviceCache()
      return { ok: true, ...result }
    }

    case 'turnOffDevice': {
      const result = await connector.turnOffDevice(args.deviceId, args.providerType)
      await refreshDeviceCache()
      return { ok: true, ...result }
    }

    case 'listConnections': {
      const connections = await connector.listConnections()
      return { ok: true, connections }
    }

    case 'getStatus': {
      const status = connector.getStatus()
      return { ok: true, ...status }
    }

    case 'disconnectAll': {
      const result = await connector.disconnectAll()
      return { ok: true, ...result }
    }

    case 'removeConnection': {
      const result = await connector.removeConnection(args.connectionId)
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
