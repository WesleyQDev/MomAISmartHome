const path = require('path')

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') })
} catch (e) {}

const connector = require('./src/index')

async function init() {
  try {
    await connector.init()
    process.send({ type: 'ready' })
  } catch (err) {
    process.send({ type: 'log', message: `Init error: ${err.message}` })
    process.exit(1)
  }
}

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

async function executeTool(toolName, args) {
  switch (toolName) {
    case 'connectToHomeAssistant': {
      const result = await connector.connectToHomeAssistant(args.url, args.token, args.name)
      return { ok: true, ...result }
    }
    case 'getDevices': {
      const devices = await connector.getDevices(args.connectionId)
      return { ok: true, devices }
    }
    case 'turnOnDevice': {
      const result = await connector.turnOnDevice(args.deviceId, args.providerType)
      return { ok: true, ...result }
    }
    case 'turnOffDevice': {
      const result = await connector.turnOffDevice(args.deviceId, args.providerType)
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
