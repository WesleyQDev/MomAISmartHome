# MomAI Home Connector (`MomAISmartHome`)

Módulo/extensão local em Node.js puro para o ecossistema **MomAI**, projetado para gerenciar autenticação **Google OAuth 2.0 (Desktop Loopback)**, armazenar tokens locais criptografados em **SQLite (AES-256-GCM)** e prover uma camada abstrata para automação e controle de dispositivos de casa inteligente (**Smart Home / IoT**).

---

## 🚀 Funcionalidades

- **Zero Backend Remoto**: Autenticação direta com o Google via servidor HTTP local temporário (`http://127.0.0.1:3333/callback`).
- **Segurança & Criptografia Local**: Tokens sensíveis (`access_token`, `refresh_token`, `id_token`) são criptografados com o algoritmo `AES-256-GCM` usando a biblioteca nativa `crypto` antes de serem gravados no banco SQLite local.
- **Auto-Refresh de Session**: Renovação automática do token de acesso expirado via `refresh_token`.
- **Abstração Smart Home (`DeviceManager`)**: Interface desacoplada para controle de dispositivos (Lâmpadas, Ar Condicionado, Tomadas) com suporte arquitetural para Matter, Home Assistant, Google Home API e Tuya.

---

## 🛠️ Requisitos e Instalação

### 1. Dependências do Módulo
No diretório `dev/MomAISmartHome`, instale as dependências executando:

```bash
pnpm install
# ou npm install
```

---

## 🔐 Configuração do Google Cloud Console (OAuth 2.0 Desktop)

Para que o login Google funcione no ambiente desktop local do usuário, siga estes passos para obter seu Client ID e Client Secret:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto novo ou selecione um existente (ex: `MomAI Smart Home`).
3. Vá em **APIs e Serviços** > **Tela de permissão OAuth** (OAuth Consent Screen):
   - Selecione **User Type**: **Externo** (External).
   - Preencha o nome do aplicativo (ex: `MomAI Home Connector`) e e-mail de suporte.
   - Na etapa de Escopos, adicione: `openid`, `.../auth/userinfo.email` e `.../auth/userinfo.profile`.
   - Adicione seu e-mail na lista de **Usuários de teste** (Test users).
4. Vá em **APIs e Serviços** > **Credenciais**:
   - Clique em **+ Criar Credenciais** > **ID do cliente OAuth**.
   - Tipo de aplicativo: Selecione **Aplicativo de Computador** (Desktop App).
   - Nome: `MomAI Desktop Client`.
5. Clique em **Criar** e copie os valores gerados para **ID de cliente** (`GOOGLE_CLIENT_ID`) e **Chave secreta do cliente** (`GOOGLE_CLIENT_SECRET`).

---

## ⚙️ Configuração do Arquivo `.env`

Crie um arquivo `.env` na raiz da extensão (`dev/MomAISmartHome/.env`) com base no `.env.example`:

```env
# Credenciais obtidas no Google Cloud Console
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://127.0.0.1:3333/callback

# Porta do servidor HTTP local temporário (loopback)
PORT=3333

# Chave secreta de 32 caracteres para criptografia AES-256 dos tokens
ENCRYPTION_KEY=momai_home_connector_secret_32b

# Caminho do banco de dados SQLite local
DB_PATH=./data/smarthome.sqlite
```

---

## 🔗 Vinculação Local da Extensão (`devsymlink`)

Para vincular esta extensão localmente na aplicação principal do MomAI via `devsymlink`, utilize a instrução de join:

```bash
# Na aplicação principal MomAI:
devsymlink/join C:\Users\wesle\dev\MomAISmartHome
```

---

## 📖 Exemplo Prático de Uso (`require`/`import`)

Exemplo de como consumir a API exportada do `MomAIHomeConnector` dentro do ecossistema principal:

```javascript
const connector = require('momai-smart-home');
// ou caso usando ES Modules / TypeScript:
// import connector from 'momai-smart-home';

async function main() {
  console.log('--- Inicializando MomAI Home Connector ---');
  
  // 1. Inicializa o banco de dados local e verifica sessão existente
  const status = await connector.init();
  console.log('Status da conexão:', status);
  // Output: { connected: false, email: null, status: 'DISCONNECTED' }

  // 2. Realiza o login (Abre o navegador padrão no fluxo Google OAuth 2.0 Loopback)
  if (!status.connected) {
    console.log('Iniciando login via Google OAuth...');
    const authStatus = await connector.login();
    console.log('Login concluído com sucesso:', authStatus);
    // Output: { connected: true, email: 'usuario@gmail.com', status: 'AUTHENTICATED' }
  }

  // 3. Conecta e lista os dispositivos de automação residencial
  await connector.devices.connect();
  const devices = await connector.devices.listDevices();
  console.log('Dispositivos disponíveis:', devices);

  // 4. Controla um dispositivo específico
  console.log('Ligando a Luz da Sala...');
  const resOn = await connector.devices.turnOn('light_living_room');
  console.log('Resultado:', resOn);

  console.log('Desligando a Luz da Sala...');
  const resOff = await connector.devices.turnOff('light_living_room');
  console.log('Resultado:', resOff);

  // 5. Encerrar sessão (logout)
  // await connector.logout();
}

main().catch(console.error);
```

---

## 🧪 Executando os Testes Automatizados

Para testar a inicialização, a criptografia SQLite e o `DeviceManager` localmente:

```bash
node test-runner.js
```
