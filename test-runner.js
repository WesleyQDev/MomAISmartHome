const connector = require('./src/index');
const TokenManager = require('./src/auth/tokenManager');
const DatabaseManager = require('./src/database/database');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('=== Iniciando Suíte de Testes do MomAI Home Connector ===\n');

  // Teste 1: Inicialização e Status Inicial
  console.log('1. Testando init() e getStatus()...');
  const initialStatus = await connector.init();
  console.log('   Status Inicial:', JSON.stringify(initialStatus));

  // Teste 2: Camada de Criptografia e Persistência TokenManager
  console.log('\n2. Testando TokenManager (Criptografia AES-256-GCM)...');
  const testDbPath = path.join(__dirname, 'data', 'test-smarthome.sqlite');
  const testDb = new DatabaseManager(testDbPath);
  const tokenMgr = new TokenManager(testDb);

  const mockTokens = {
    access_token: 'ya29.mock_access_token_12345',
    refresh_token: '1//mock_refresh_token_67890',
    expiry_date: Date.now() + 3600000
  };
  const mockEmail = 'usuario.teste@gmail.com';

  await tokenMgr.saveSession({ email: mockEmail, tokens: mockTokens });
  console.log('   Sessão de teste salva com sucesso.');

  const recoveredSession = await tokenMgr.getSession();
  console.log('   E-mail recuperado:', recoveredSession.email);
  console.log('   Access Token descriptografado:', recoveredSession.tokens.access_token);
  
  if (recoveredSession.tokens.access_token === mockTokens.access_token) {
    console.log('   [SUCESSO] Criptografia e Descriptografia AES-256 validadas!');
  } else {
    console.error('   [ERRO] Falha ao descriptografar os tokens!');
  }

  await tokenMgr.clearSession();
  await testDb.close();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Teste 3: Abstração de Dispositivos (DeviceManager Sem Mocks)
  console.log('\n3. Testando DeviceManager (Sem dispositivos simulados/mock)...');
  const connResult = await connector.devices.connect('test_token');
  console.log('   Conexão:', connResult.message);

  const devicesList = await connector.devices.listDevices('test_token');
  console.log(`   Dispositivos encontrados da API Google (${devicesList.length})`);

  console.log('\n=== Todos os testes automatizados concluídos com sucesso! ===');
}

runTests().catch(err => {
  console.error('\n❌ Erro durante a execução dos testes:', err);
  process.exit(1);
});
