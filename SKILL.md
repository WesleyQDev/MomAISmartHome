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
  - name: control_device
    description: Liga, desliga ou ajusta um dispositivo inteligente
    parameters:
      type: object
      required:
        - device_name
        - action
      properties:
        device_name:
          type: string
          description: Nome do dispositivo
        action:
          type: string
          enum:
            - on
            - off
            - toggle
          description: Ação a executar
        brightness:
          type: number
          description: Brilho (0-100) apenas para luzes
  - name: list_devices
    description: Lista todos os dispositivos com seus estados atuais
    parameters:
      type: object
      properties:
        room:
          type: string
          description: Filtrar por cômodo
  - name: query_device
    description: Obtém o estado detalhado de um dispositivo
    parameters:
      type: object
      required:
        - device_name
      properties:
        device_name:
          type: string
          description: Nome do dispositivo
---

Integração com Home Assistant e suporte a múltiplos provedores de automação residencial. Controle luzes, climatização, sensores, câmeras e muito mais.
