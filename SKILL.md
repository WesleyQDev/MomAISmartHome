# MomAI Smart Home

Integração com Home Assistant e suporte a múltiplos provedores de automação residencial.

## Tools

- `connectToHomeAssistant(url, token, name?)` — Conecta a um servidor Home Assistant
- `listDevices(connectionId?)` — Lista dispositivos de todas as conexões
- `turnOnDevice(deviceId, providerType?)` — Liga um dispositivo
- `turnOffDevice(deviceId, providerType?)` — Desliga um dispositivo
- `callService(domain, service, data)` — Chama qualquer serviço do Home Assistant
- `listConnections()` — Lista conexões salvas
- `removeConnection(id)` — Remove uma conexão
- `getStatus()` — Status atual das conexões
