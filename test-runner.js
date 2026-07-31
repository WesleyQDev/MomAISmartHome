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

  // Test 7: executeTool returns structured result
  const unknownRes = await runtime.executeTool('unknown_tool', {})
  assert('executeTool para ferramenta desconhecida retorna ok: false', unknownRes && unknownRes.ok === false)

  await db.close()
  console.log(`\n=== Resultado: ${passed} passaram, ${failed} falharam ===`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((err) => {
  console.error('Test runner crash:', err)
  process.exit(1)
})
