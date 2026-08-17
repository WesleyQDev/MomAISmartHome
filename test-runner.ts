process.env.DB_PATH = ':memory:'
const fs = require('fs')
const os = require('os')
const path = require('path')
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

  const BetterSqlite3 = require('better-sqlite3')
  const migrationDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-migration-'))
  const migrationPath = path.join(migrationDir, 'smarthome.sqlite')
  const legacyDb = new BetterSqlite3(migrationPath)
  legacyDb.exec(`CREATE TABLE connections (
    id TEXT PRIMARY KEY,
    provider_type TEXT NOT NULL,
    name TEXT,
    config_encrypted TEXT NOT NULL,
    user_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  legacyDb.close()
  const migratedDb = new DatabaseManager(migrationPath)
  await migratedDb.init()
  const migratedColumns = await migratedDb.all('PRAGMA table_info(connections)')
  const migratedAutoConnect = migratedColumns.find((column) => column.name === 'auto_connect')
  await migratedDb.run(
    `INSERT INTO connections (id, provider_type, name, config_encrypted, user_email) VALUES (?, ?, ?, ?, ?)`,
    ['migration_test', 'homeassistant', 'Migration HA', '{}', 'local']
  )
  const migratedRow = await migratedDb.get('SELECT auto_connect FROM connections WHERE id = ?', ['migration_test'])
  assert('migração adiciona auto_connect com default ativo', migratedAutoConnect && migratedAutoConnect.dflt_value === '1' && migratedRow.auto_connect === 1)
  await migratedDb.close()
  fs.rmSync(migrationDir, { recursive: true, force: true })

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
  await mockMomai.storage.set('last_credentials', {
    url: 'http://ha.local:8123',
    token: 'mock_token',
    name: 'Home Assistant Test'
  })

  const savedMock = await mockMomai.storage.get('connections')
  assert('momai.storage gravou conexão mock', savedMock && savedMock.ha_test && savedMock.ha_test.token === 'mock_token')

  // Test 8a: explicit disconnect preserves the encrypted credential but disables auto-reconnect
  const Connector = MomAIHomeConnector.MomAIHomeConnector
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-'))
  const isolatedDbPath = path.join(tempDir, 'smarthome.sqlite')
  const isolatedConnector = new Connector({ dbPath: isolatedDbPath })
  const isolatedStorageStore = new Map()
  const isolatedMomai = {
    storage: {
      storageDir: tempDir,
      async get(key) { return isolatedStorageStore.get(key) || null },
      async set(key, val) { isolatedStorageStore.set(key, val) }
    }
  }
  let providerRegistrations = 0
  isolatedConnector.devices.disconnectAll = async () => isolatedConnector.devices.providers.clear()
  isolatedConnector.devices.registerProvider = async () => {
    providerRegistrations++
    return { success: true }
  }
  isolatedConnector.devices.listDevices = async () => []

  const firstResult = await isolatedConnector.connectToHomeAssistant('http://ha.local:8123', 'first-test-token', 'Test HA', isolatedMomai)
  const firstRow = await isolatedConnector.dbManager.get('SELECT auto_connect FROM connections WHERE id = ?', [firstResult.connectionId])
  assert('connectToHomeAssistant persiste conexão criptografada elegível', providerRegistrations === 1 && firstRow?.auto_connect === 1)

  await isolatedConnector.disconnectAll(isolatedMomai)
  const clearedLast = await isolatedMomai.storage.get('last_credentials')
  const clearedConnections = await isolatedMomai.storage.get('connections')
  const inactiveRow = await isolatedConnector.dbManager.get('SELECT auto_connect FROM connections WHERE id = ?', [firstResult.connectionId])
  const preservedConnection = await isolatedConnector.tokenManager.getConnection(firstResult.connectionId)
  assert('disconnectAll desativa auto-reconexão e preserva credencial', inactiveRow?.auto_connect === 0 && preservedConnection?.config.token === 'first-test-token')
  assert('disconnectAll limpa storage e estado em memória', clearedLast === null && clearedConnections && Object.keys(clearedConnections).length === 0 && isolatedConnector.lastCredentials === null && isolatedConnector.auth.getToken() === '')

  const restartedConnector = new Connector({ dbPath: isolatedDbPath })
  let restartedRegistrations = 0
  restartedConnector.devices.disconnectAll = async () => restartedConnector.devices.providers.clear()
  restartedConnector.devices.registerProvider = async () => {
    restartedRegistrations++
    return { success: true }
  }
  restartedConnector.devices.listDevices = async () => []
  await restartedConnector.init(isolatedMomai)
  await restartedConnector.ensureConnected(isolatedMomai)
  const restartedLastConnection = await restartedConnector.getLastConnection(isolatedMomai)
  assert('reinício não registra provider após disconnect explícito', restartedRegistrations === 0 && (await restartedConnector.listConnections()).length === 0)
  assert('getLastConnection recupera credencial inativa após reinício', restartedLastConnection.url === 'http://ha.local:8123' && restartedLastConnection.token === 'first-test-token')

  const secondResult = await restartedConnector.connectToHomeAssistant('http://ha.local:8123', 'second-test-token', 'Test HA', isolatedMomai)
  const secondRow = await restartedConnector.dbManager.get('SELECT auto_connect FROM connections WHERE id = ?', [secondResult.connectionId])
  const secondPersistedConnection = await restartedConnector.tokenManager.getConnection(secondResult.connectionId)
  assert('conectar novamente reativa auto-reconexão e preserva token', restartedRegistrations === 1 && secondRow?.auto_connect === 1 && secondPersistedConnection.config.token === 'second-test-token')
  await isolatedConnector.disconnectAll(isolatedMomai)
  await restartedConnector.dbManager.close()
  await isolatedConnector.dbManager.close()
  fs.rmSync(tempDir, { recursive: true, force: true })

  const firstStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-storage-a-'))
  const secondStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'momai-smarthome-storage-b-'))
  const switchedConnector = new Connector({ dbPath: path.join(firstStorageDir, 'smarthome.sqlite') })
  const secondDb = new DatabaseManager(path.join(secondStorageDir, 'smarthome.sqlite'))
  const secondTokenManager = new TokenManager(secondDb)
  secondTokenManager.reloadKey(secondStorageDir)
  await secondTokenManager.saveConnection('switched_connection', 'homeassistant', { url: 'http://switched.local:8123', token: 'switched-token' }, 'Switched HA', 'local')
  await switchedConnector.init({ storage: { storageDir: firstStorageDir } })
  const switchedLastConnection = await switchedConnector.getLastConnection({ storage: { storageDir: secondStorageDir } })
  assert('getLastConnection reabre o banco ao trocar storageDir', switchedLastConnection?.token === 'switched-token')
  await switchedConnector.dbManager.close()
  await secondDb.close()
  fs.rmSync(firstStorageDir, { recursive: true, force: true })
  fs.rmSync(secondStorageDir, { recursive: true, force: true })

  let eventDispatched = false
  let lastOverlayPayload = null
  const mockMomaiWithEvent = {
    ...mockMomai,
    sendEvent(type, payload) {
      if (type === 'open_overlay') {
        eventDispatched = true
        lastOverlayPayload = payload
      }
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
  assert('open_device_control usa strategy replace (um único overlay)', lastOverlayPayload && lastOverlayPayload.strategy === 'replace')
  assert('open_device_control envia overlayId do dispositivo', lastOverlayPayload && lastOverlayPayload.overlayId === 'media_player.tv_quarto')

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
  assert('getLastConnection devolve url e token para persistência na UI', lastConnection && lastConnection.url && lastConnection.token)

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

  // Test TV Remote Commands (YouTube, HDMI 1, HDMI 2, AV)
  serviceCalls.length = 0
  provider._get = async (path) => {
    if (path === '/api/states') {
      return [
        { entity_id: 'media_player.tv_quarto', state: 'on' },
        { entity_id: 'remote.tv_quarto', state: 'on' }
      ]
    }
    return null
  }

  await provider.sendRemoteCommand('media_player.tv_quarto', 'YOUTUBE')
  const youtubeCallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'com.google.android.youtube.tv')
  const youtubeCallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'com.google.android.youtube.tv')
  assert('sendRemoteCommand YOUTUBE envia play_media app youtube e remote turn_on', Boolean(youtubeCallMp && youtubeCallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'HDMI 1')
  const hdmi1CallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_1')
  const hdmi1CallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_1')
  assert('sendRemoteCommand HDMI 1 envia play_media passthrough://media_1 e remote turn_on', Boolean(hdmi1CallMp && hdmi1CallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'HDMI 2')
  const hdmi2CallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_2')
  const hdmi2CallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_2')
  assert('sendRemoteCommand HDMI 2 envia play_media passthrough://media_2 e remote turn_on', Boolean(hdmi2CallMp && hdmi2CallRm))

  serviceCalls.length = 0
  await provider.sendRemoteCommand('media_player.tv_quarto', 'AV')
  const avCallMp = serviceCalls.find(c => c.path === '/api/services/media_player/play_media' && c.payload.media_content_id === 'passthrough://media_av')
  const avCallRm = serviceCalls.find(c => c.path === '/api/services/remote/turn_on' && c.payload.activity === 'passthrough://media_av')
  assert('sendRemoteCommand AV envia play_media passthrough://media_av e remote turn_on', Boolean(avCallMp && avCallRm))


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
  await provider.disconnect()

  // Test 11: Resiliência de descriptografia entre instâncias do TokenManager
  const tm2 = new TokenManager(db)
  await tm2.saveConnection('test_persist', 'homeassistant', { url: 'http://ha.local:8123', token: 'secret_token_123' }, 'Persist HA', 'local')
  const tm3 = new TokenManager(db)
  const connPersist = await tm3.getConnection('test_persist')
  assert('TokenManager recupera e descriptografa conexão em nova instância', connPersist && connPersist.config && connPersist.config.token === 'secret_token_123')

  await db.run(
    `INSERT INTO connections (id, provider_type, name, config_encrypted, user_email) VALUES (?, ?, ?, ?, ?)`,
    ['legacy_plain', 'homeassistant', 'Legacy HA', JSON.stringify({ url: 'http://legacy.local:8123', token: 'legacy_token' }), 'local']
  )
  const legacyConnection = await tm.getConnection('legacy_plain')
  const migratedLegacy = JSON.parse(await db.get(`SELECT config_encrypted FROM connections WHERE id = ?`, ['legacy_plain']).then((row) => row.config_encrypted))
  assert('TokenManager lê e migra conexão legada plaintext', legacyConnection && legacyConnection.config.token === 'legacy_token' && migratedLegacy.encryptedData && migratedLegacy.iv && migratedLegacy.authTag)

  const legacyTokenManager = new TokenManager(db)
  legacyTokenManager.encryptionSecret = 'momai_home_connector_secret_32b'
  await db.run(
    `INSERT INTO connections (id, provider_type, name, config_encrypted, user_email) VALUES (?, ?, ?, ?, ?)`,
    ['legacy_encrypted', 'homeassistant', 'Legacy Encrypted HA', JSON.stringify(legacyTokenManager.encrypt({ url: 'http://legacy.local:8123', token: 'legacy_encrypted_token' })), 'local']
  )
  const legacyEncryptedConnection = await tm.getConnection('legacy_encrypted')
  assert('TokenManager lê e migra conexão legada criptografada', legacyEncryptedConnection && legacyEncryptedConnection.config.token === 'legacy_encrypted_token')

  // Test 12: listDevices tenta reconectar quando provido de URL e Token mas desconnectado
  const offlineProvider = new HomeAssistantProvider({ url: 'http://ha.local:8123', token: 'test_token' })
  offlineProvider.connected = false
  let connectAttempted = false
  offlineProvider.connect = async () => {
    connectAttempted = true
    offlineProvider.connected = true
    return { success: true }
  }
  // Após reconectar, o fetch de /api/states devolve os dispositivos.
  offlineProvider._get = async () => [
    { entity_id: 'light.reconnect', state: 'on', attributes: { friendly_name: 'Luz Reconectada' } }
  ]
  const offlineDevs = await offlineProvider.listDevices()
  assert('listDevices reconecta automaticamente se desconectado', connectAttempted && offlineDevs.length > 0 && offlineDevs[0].id === 'light.reconnect')
  await offlineProvider.disconnect()

  // Test 13: list_devices em runtime.js indica erro quando sem conexão
  MomAIHomeConnector.isConnected = false
  MomAIHomeConnector.devices.providers.clear()
  const listErrRes = await runtime.executeTool('list_devices', {}, mockMomai)
  assert('list_devices retorna erro descritivo quando desconectado', listErrRes && listErrRes.ok === false && typeof listErrRes.error === 'string')

  await db.close()
  console.log(`\n=== Resultado: ${passed} passaram, ${failed} falharam ===`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test runner crash:', err)
  process.exit(1)
})
