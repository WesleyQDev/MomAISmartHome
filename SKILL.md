---
name: MomAI Smart Home
description: Controle dispositivos inteligentes da sua casa: luzes, temperatura, sensores, fechaduras, cortinas, câmeras e muito mais via Home Assistant.
author: MomAI Team
version: 1.0.1
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
intents:
  - luz
  - luzes
  - ligar
  - desligar
  - acender
  - apagar
  - temperatura
  - termostato
  - dispositivo
  - dispositivos
  - casa inteligente
  - smart home
  - sensor
  - sensores
  - cômodo
  - iluminação
  - climatização
  - fechadura
  - cortina
  - cor
  - cores
  - vermelho
  - azul
  - verde
  - amarelo
  - roxo
  - rosa
  - tv
  - televisão
  - volume
  - mute
  - mudo
  - canal
  - controle remoto
  - entrada
  - hdmi
  - netflix
  - ar condicionado
tools:
  - name: control_device
    description: Liga, desliga ou ajusta um dispositivo inteligente (luzes, interruptores, etc)
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
          description: Brilho (0-100)
        color:
          type: string
          description: Cor da lâmpada (nome da cor como "vermelho", "azul", "verde", "amarelo", "rosa", "quente", "frio" ou HEX "#FF0000")
  - name: set_light_color
    description: Altera a cor, brilho ou temperatura de cor de uma lâmpada inteligente ou fita LED
    parameters:
      type: object
      required:
        - device_name
      properties:
        device_name:
          type: string
          description: Nome da lâmpada
        color:
          type: string
          description: Nome da cor (ex: "vermelho", "azul", "verde", "amarelo", "roxo", "rosa", "laranja", "branco", "quente", "frio") ou formato HEX
        brightness:
          type: number
          description: Porcentagem de brilho (0-100)
        color_temp:
          type: number
          description: Temperatura da cor em Kelvin (ex: 2700K a 6500K)
  - name: control_tv_remote
    description: Controle remoto de TV e Media Player: comandos de botão (power, volume, mute, canais), alternância de entrada (HDMI 1, Netflix) e reprodução
    parameters:
      type: object
      required:
        - device_name
      properties:
        device_name:
          type: string
          description: Nome da TV ou reprodutor de mídia
        command:
          type: string
          description: Botão do controle remoto (power, volume_up, volume_down, mute, channel_up, channel_down, play, pause, home, back, select)
        action:
          type: string
          enum:
            - play
            - pause
            - stop
            - next
            - previous
            - volume_up
            - volume_down
            - mute
            - unmute
            - source
            - volume
          description: Ação de mídia
        value:
          type: string
          description: Valor para ação (volume 0-100 ou nome da entrada/fonte como "HDMI 1", "Netflix")
  - name: control_climate
    description: Ajusta temperatura e modo do ar condicionado ou termostato
    parameters:
      type: object
      required:
        - device_name
      properties:
        device_name:
          type: string
          description: Nome do ar condicionado
        temperature:
          type: number
          description: Temperatura desejada em °C
        hvac_mode:
          type: string
          enum:
            - cool
            - heat
            - fan_only
            - auto
            - off
          description: Modo de operação
  - name: call_ha_service
    description: Executa um serviço arbitrário do Home Assistant
    parameters:
      type: object
      required:
        - domain
        - service
      properties:
        domain:
          type: string
          description: Domínio (ex: light, media_player, remote, climate)
        service:
          type: string
          description: Serviço (ex: turn_on, send_command, select_source)
        data:
          type: object
          description: Dados do serviço em JSON
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
  - name: open_device_control
    description: Abre a interface de controle flutuante (overlay window) de um dispositivo específico (TV, controle remoto, lâmpada, ar condicionado, etc) quando o usuário pede para abrir ou exibir a tela de controle do dispositivo.
    parameters:
      type: object
      required:
        - device_name
      properties:
        device_name:
          type: string
          description: Nome do dispositivo cujo controle deve ser exibido (ex: "televisão", "luz da sala", "ar condicionado")
---

Integração completa com Home Assistant e suporte a múltiplos provedores de automação residencial. Controle cores de luzes, brilho, TV, controle remoto, volume, climatização, sensores e muito mais.
