process.env.DB_PATH = ':memory:'
const MomAIHomeConnector = require('./src/index')

async function runTests() {
  console.log('=== MomAI Smart Home - Test Runner ===\n')
  let passed = 0
  let failed = 0

  function assert(name, condition) {
    if (condition) {
      console.log(`  ✅ ${name}`)
      passed++
    } else {
      console.log(`  ❌ ${name}`)
      failed++
    }
  }

  // Test 1: init() returns status
  try {
    const status = await MomAIHomeConnector.init()
    assert('init() retorna status', status && typeof status.connected === 'boolean')
    assert('init() retorna connections array', Array.isArray(status.connections))
    assert('init() retorna providerStatus', status.providerStatus && typeof status.providerStatus === 'object')
  } catch (err) {
    console.log(`  ❌ init() lançou exceção: ${err.message}`)
    failed++
  }

  // Test 2: getStatus() returns expected shape
  const freshStatus = MomAIHomeConnector.getStatus()
  assert('getStatus().connected é booleano', typeof freshStatus.connected === 'boolean')
  assert('getStatus().connections é array', Array.isArray(freshStatus.connections))

  // Test 3: getDevices() returns array when disconnected
  const devices = await MomAIHomeConnector.getDevices()
  assert('getDevices() retorna array', Array.isArray(devices))

  // Test 4: disconnectAll() returns success
  const discResult = await MomAIHomeConnector.disconnectAll()
  assert('disconnectAll() retorna success', discResult && discResult.success === true)

  // Test 5: Connection storage round-trip
  const TokenManager = require('./src/auth/tokenManager')
  const DatabaseManager = require('./src/database/database')
  const db = new DatabaseManager()
  const tm = new TokenManager(db)

  await tm.saveConnection('test_ha', 'homeassistant', { url: 'http://ha.local:8123', token: 'test_token' }, 'Test HA', 'test@local')
  const conn = await tm.getConnection('test_ha')
  assert('saveConnection/getConnection round-trip', conn && conn.id === 'test_ha' && conn.providerType === 'homeassistant' && conn.config.url === 'http://ha.local:8123')

  const list = await tm.listConnections()
  assert('listConnections retorna array', Array.isArray(list) && list.length > 0)

  await tm.removeConnection('test_ha')
  const afterDel = await tm.getConnection('test_ha')
  assert('removeConnection funciona', afterDel === null)

  // Test 6: runtime.js tool export check
  const runtime = require('./runtime')
  assert('runtime.tools é array', Array.isArray(runtime.tools))
  assert('runtime.tools contém set_light_color', runtime.tools.some(t => t.name === 'set_light_color'))
  assert('runtime.tools contém control_tv_remote', runtime.tools.some(t => t.name === 'control_tv_remote'))
  assert('runtime.tools contém control_climate', runtime.tools.some(t => t.name === 'control_climate'))
  assert('runtime.tools contém call_ha_service', runtime.tools.some(t => t.name === 'call_ha_service'))
  assert('runtime.tools contém open_device_control', runtime.tools.some(t => t.name === 'open_device_control'))

  // Test 7: executeTool returns structured result
  const unknownRes = await runtime.executeTool('unknown_tool', {}, {})
  assert('executeTool para ferramenta desconhecida retorna ok: false', unknownRes && unknownRes.ok === false)

  // Test 8: momai.storage & ensureConnected integration
  const mockStorageStore = new Map()
  const mockMomai = {
    storage: {
      async get(key) { return mockStorageStore.get(key) || null },
      async set(key, val) { mockStorageStore.set(key, val) }
    }
  }

  await MomAIHomeConnector.disconnectAll(mockMomai)
  const emptyStorageConns = await mockMomai.storage.get('connections')
  assert('momai.storage disconnectAll limpa conexões', emptyStorageConns && Object.keys(emptyStorageConns).length === 0)

  await mockMomai.storage.set('connections', {
    ha_test: {
      id: 'ha_test',
      type: 'homeassistant',
      name: 'Home Assistant Test',
      url: 'http://ha.local:8123',
      token: 'mock_token'
    }
  })

  const savedMock = await mockMomai.storage.get('connections')
  assert('momai.storage gravou conexão mock', savedMock && savedMock.ha_test && savedMock.ha_test.token === 'mock_token')

  let eventDispatched = false
  const mockMomaiWithEvent = {
    ...mockMomai,
    sendEvent(type) {
      if (type === 'open_overlay') eventDispatched = true
    }
  }

  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      {
        id: 'media_player.tv_quarto',
        name: 'TV do Quarto',
        domain: 'media_player',
        provider: 'homeassistant',
        state: { on: true }
      }
    ]
  })

  const openRes = await runtime.executeTool({
    toolName: 'open_device_control',
    args: { device_name: 'TV do Quarto' },
    momai: mockMomaiWithEvent
  })

  assert('open_device_control com objeto único desempacota e executa', openRes && openRes.ok === true)
  assert('open_device_control dispara momai.sendEvent(open_overlay)', eventDispatched === true)

  let toggled = false
  MomAIHomeConnector.devices.providers.set('homeassistant', {
    listDevices: async () => [
      {
        id: 'light.sala',
        name: 'Luz da Sala',
        domain: 'light',
        provider: 'homeassistant',
        state: { on: false }
      }
    ],
    toggle: async () => {
      toggled = true
      return { success: true }
    }
  })

  const toggleRes = await runtime.executeTool('control_device', {
    device_name: 'Luz da Sala',
    action: 'toggle'
  }, mockMomai)
  assert('control_device usa toggle real', toggleRes && toggleRes.ok === true && toggled === true)

  const lastConnection = await MomAIHomeConnector.getLastConnection(mockMomai)
  assert('getLastConnection não devolve token ao renderer', lastConnection && !Object.prototype.hasOwnProperty.call(lastConnection, 'token'))

  const HomeAssistantProvider = require('./src/integrations/providers/homeAssistant')
  const provider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  provider.connected = true
  const serviceCalls = []
  provider._post = async (path, payload) => {
    serviceCalls.push({ path, payload })
    return { ok: true }
  }
  provider.cachedDevices.set('light.sala', { id: 'light.sala', state: { on: false } })
  await provider.turnOn('light.sala', { brightness: 35, color: 'vermelho' })
  assert('provider envia brilho e cor para light.turn_on', serviceCalls[0]?.path === '/api/services/light/turn_on' && serviceCalls[0].payload.brightness_pct === 35 && serviceCalls[0].payload.rgb_color[0] === 255)
  await provider.toggle('light.sala')
  assert('provider envia light.toggle', serviceCalls[1]?.path === '/api/services/light/toggle')
  await provider.setClimate('climate.sala', 22, 'cool')
  assert('provider envia temperatura e modo de clima', serviceCalls[2]?.path === '/api/services/climate/set_temperature' && serviceCalls[3]?.path === '/api/services/climate/set_hvac_mode')

  // Test 9: WebSocket state_changed propagation
  let wsStateChangedEmitted = false
  let receivedDevice = null
  provider.on('state_changed', (evt) => {
    wsStateChangedEmitted = true
    receivedDevice = evt.device
  })

  // Simula o recebimento de mensagem state_changed vinda do WebSocket do Home Assistant
  provider._handleWsMessage({
    type: 'event',
    event: {
      event_type: 'state_changed',
      data: {
        entity_id: 'switch.cafe',
        new_state: {
          entity_id: 'switch.cafe',
          state: 'on',
          attributes: { friendly_name: 'Cafeteira da Cozinha' }
        }
      }
    }
  })

  assert('HomeAssistantProvider processa evento WebSocket state_changed e emite evento local', wsStateChangedEmitted && receivedDevice && receivedDevice.id === 'switch.cafe' && receivedDevice.state.on === true)

  // Test 10: Closing connecting WebSocket does not crash with unhandled error
  let closedWithoutError = true
  try {
    const { EventEmitter } = require('events')
    const mockSocket = new EventEmitter()
    mockSocket.readyState = 0 // CONNECTING
    mockSocket.terminate = function() {
      process.nextTick(() => {
        const err = new Error('WebSocket was closed before the connection was established')
        mockSocket.emit('error', err)
      })
    }
    provider.ws = mockSocket
    provider._closeWebSocket(false)
    await new Promise((resolve) => setTimeout(resolve, 50))
  } catch (err) {
    closedWithoutError = false
  }
  assert('Encerrar WebSocket em estado CONNECTING não lança erro não tratado', closedWithoutError)

  await db.close()
  console.log(`\n=== Resultado: ${passed} passaram, ${failed} falharam ===`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test runner crash:', err)
  process.exit(1)
})
