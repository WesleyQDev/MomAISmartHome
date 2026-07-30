# MomAI Smart Home (`MomAISmartHome`)

Extensão local em Node.js para o ecossistema **MomAI** que conecta e gerencia dispositivos de automação residencial via **Home Assistant** e outros provedores plugáveis.

Armazena conexões de forma criptografada em **SQLite (AES-256-GCM)** e provê uma interface React para controle.

---

## Arquitetura de Provedores

A extensão usa um padrão de **provedores** para suportar múltiplos sistemas de automação:

```
integrations/
  provider.js              ← Classe base abstrata
  providers/
    homeAssistant.js       ← Provedor Home Assistant (REST API)
  deviceManager.js         ← Registry/Facade que gerencia provedores
```

Cada provedor implementa: `connect()`, `disconnect()`, `listDevices()`, `turnOn()`, `turnOff()`.

### Adicionar novo provedor

1. Criar `src/integrations/providers/meuProvider.js` estendendo `BaseProvider`
2. Registrar em `src/integrations/deviceManager.js` no `PROVIDER_REGISTRY`
3. Os métodos do provider já são expostos automaticamente

---

## Configuração

### Home Assistant

1. No Home Assistant, vá em **Perfil** → **Tokens de Acesso Long-Lived**
2. Gere um token e copie
3. Configure no arquivo `.env` ou na interface da extensão

```
HA_URL=http://homeassistant.local:8123
HA_TOKEN=seu_token_aqui
```

### Ambiente

```
ENCRYPTION_KEY=chave_de_32_caracteres
DB_PATH=./data/smarthome.sqlite
```

---

## Estrutura do Projeto

```
├── src/
│   ├── index.js              ← Entry point, orquestrador
│   ├── page.tsx              ← UI React (bundlada com esbuild)
│   ├── config/constants.js   ← Constantes de configuração
│   ├── auth/
│   │   ├── tokenManager.js   ← Criptografia AES-256-GCM + persistência
│   │   └── haAuth.js         ← Gerenciamento de credenciais HA
│   ├── database/
│   │   └── database.js       ← SQLite wrapper
│   └── integrations/
│       ├── provider.js       ← Classe base de provedor
│       ├── providers/
│       │   └── homeAssistant.js ← Provedor Home Assistant
│       └── deviceManager.js  ← Registry/Facade de provedores
├── manifest.json
├── build.mjs
├── package.json
└── pnpm-lock.yaml
```

## Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `connections` | Conexões com provedores (url, token criptografado) |
| `cached_entities` | Cache de dispositivos/entidades |
| `rooms` | Cômodos mapeados |
| `sessions` | (Compatibilidade) |

## Comandos

```bash
pnpm install
pnpm test
pnpm build    # build.mjs → dist/page.js
```

---

## Provider Pattern: Google Home (futuro)

Para adicionar suporte a Google Home no futuro, crie `integrations/providers/googleHome.js`:

```js
const BaseProvider = require('../provider')
class GoogleHomeProvider extends BaseProvider {
  async connect() { /* OAuth 2.0 + HomeGraph API */ }
  async listDevices() { /* GET /v1/devices:sync */ }
  async turnOn(deviceId) { /* POST /v1/devices:reportStateAndNotification */ }
  async turnOff(deviceId) { /* ... */ }
}
module.exports = GoogleHomeProvider
```

Depois registre em `deviceManager.js`:
```js
const GoogleHomeProvider = require('./providers/googleHome')
PROVIDER_REGISTRY['googlehome'] = GoogleHomeProvider
```
