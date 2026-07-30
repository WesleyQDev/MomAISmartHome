const path = require('path')

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') })
} catch (e) {}

const connector = require('./src/index')

let deviceCache = { names: [], byRoom: {} }
let ready = false

async function init() {
  try {
    await connector.init()
    ready = true
    process.send({ type: 'ready' })
  } catch (err) {
    process.send({ type: 'log', message: `Init error: ${err.message}` })
    process.exit(1)
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
    description: 'Liga, desliga ou ajusta um dispositivo inteligente. Use list_devices primeiro para ver os nomes disponíveis.',
    parameters: {
      type: 'object',
      required: ['device_name', 'action'],
      properties: {
        device_name: {
          type: 'string',
          description: 'Nome exato do dispositivo'
        },
        action: {
          type: 'string',
          enum: ['on', 'off', 'toggle'],
          description: 'Ação a executar'
        },
        brightness: {
          type: 'number',
          description: 'Brilho (0-100) apenas para luzes'
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
      if (args.action === 'on' || args.action === 'toggle') {
        result = await connector.turnOnDevice(device.id, provider)
      } else {
        result = await connector.turnOffDevice(device.id, provider)
      }
      await refreshDeviceCache()
      if (result && result.success === false) {
        return { ok: false, error: `Falha ao ${args.action === 'on' ? 'ligar' : 'desligar'} "${device.name}": ${result.error || 'erro desconhecido'}` }
      }
      return { ok: true, device: device.name, action: args.action }
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

    case 'connectToHomeAssistant':
      await connector.connectToHomeAssistant(args.url, args.token, args.name)
      await refreshDeviceCache()
      return { ok: true }

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
      const result = await connector.callService(args.domain, args.service, args.data)
      return { ok: true, result }
    }

    default:
      return { ok: false, error: `Unknown tool: ${toolName}` }
  }
}
