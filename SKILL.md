---
name: MomAI Smart Home
description: Integração com Home Assistant e suporte a múltiplos provedores de automação residencial.
author: MomAI Team
version: 1.0.0
icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><path d="M6.5 12a7.8 7.8 0 0 1 11 0"/><path d="M9 15a3.6 3.6 0 0 1 6 0"/><path d="M12 18h.01"/></svg>
compatibility: MomAI Node Core
tags:
  - smart home
  - home assistant
  - iot
  - automation
permissions:
  - network
  - storage
tools:
  - name: connectToHomeAssistant
    description: Conecta a um servidor Home Assistant
    parameters:
      type: object
      properties:
        url:
          type: string
          description: URL do servidor Home Assistant
        token:
          type: string
          description: Long-Lived Access Token
  - name: listDevices
    description: Lista dispositivos de todas as conexões
  - name: turnOnDevice
    description: Liga um dispositivo
  - name: turnOffDevice
    description: Desliga um dispositivo
  - name: callService
    description: Chama qualquer serviço do Home Assistant
  - name: listConnections
    description: Lista conexões salvas
  - name: removeConnection
    description: Remove uma conexão
  - name: getStatus
    description: Status atual das conexões
---

Integração com Home Assistant e suporte a múltiplos provedores de automação residencial. Controle luzes, climatização, sensores, câmeras e muito mais.
