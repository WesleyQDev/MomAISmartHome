import React, { useState, useRef } from 'react'
import {
  SvgPower,
  SvgSun,
  SvgColorWheel,
  SvgTemp,
  SvgPlay,
  SvgPause,
  SvgPrev,
  SvgNext,
  SvgMute,
  SvgMuteStrikethrough,
  SvgVolDown,
  SvgVolUp,
  SvgHome,
  SvgBack,
  SvgTv,
  SvgYoutube,
  getDomainSvgIcon,
  getDynamicSvgIcon
} from './SvgIcons'

export interface EntityState {
  on?: boolean
  brightness?: number | null
  temperature?: number | null
  targetTemperature?: number | null
  hvacMode?: string
  hvacModes?: string[]
  position?: number | null
  isOpen?: boolean
  value?: string
  unit?: string
  locked?: boolean
  volume?: number | null
  mediaTitle?: string | null
  colorTemp?: number | null
  rawState?: string
  elevation?: number | null
  azimuth?: number | null
  rising?: boolean
  humidity?: number | null
  pressure?: number | null
  windSpeed?: number | null
  deviceClass?: string
}

export interface EntityAttributes {
  supported?: string[]
  next_rising?: string
  next_setting?: string
  next_dawn?: string
  next_dusk?: string
  deviceClass?: string
  unitOfMeasurement?: string
  haIcon?: string
  source_list?: string[]
  relatedEntities?: Device[]
  [key: string]: unknown
}

export interface Device {
  id: string
  name: string
  type: string
  domain: string
  icon: string
  room: string
  provider: string
  online: boolean
  state: EntityState
  attributes: EntityAttributes
}

function volumeToPercent(volume: number | null | undefined): number {
  if (volume === null || volume === undefined || !Number.isFinite(volume)) return 0
  return Math.max(0, Math.min(100, Math.round(volume * 100)))
}

export const DOMAIN_LABELS: Record<string, string> = {
  light: 'Iluminação',
  switch: 'Interruptor',
  fan: 'Ventilador',
  cover: 'Persiana',
  lock: 'Fechadura',
  climate: 'Climatização',
  sensor: 'Sensor',
  binary_sensor: 'Sensor Binário',
  media_player: 'Mídia / TV',
  camera: 'Câmera',
  vacuum: 'Aspirador',
  scene: 'Cena',
  automation: 'Automação',
  alarm_control_panel: 'Alarme',
  remote: 'Controle Remoto',
  sun: 'Sol',
  weather: 'Clima'
}

export const CONTROLLABLE_DOMAINS = [
  'light',
  'switch',
  'fan',
  'cover',
  'lock',
  'climate',
  'media_player',
  'vacuum',
  'alarm_control_panel',
  'camera',
  'automation',
  'scene',
  'remote'
]

// Re-export Svg components for backward compatibility
export {
  SvgPower,
  SvgSun,
  SvgColorWheel,
  SvgTemp,
  SvgPlay,
  SvgPause,
  SvgPrev,
  SvgNext,
  SvgMute,
  SvgMuteStrikethrough,
  SvgVolDown,
  SvgVolUp,
  SvgHome,
  SvgBack,
  SvgTv,
  SvgYoutube
}

export const DOMAIN_ICONS: Record<string, string> = {
  light: 'light',
  switch: 'switch',
  fan: 'fan',
  cover: 'cover',
  lock: 'lock',
  climate: 'climate',
  sensor: 'sensor',
  binary_sensor: 'binary_sensor',
  media_player: 'media_player',
  camera: 'camera',
  vacuum: 'vacuum',
  scene: 'scene',
  automation: 'automation',
  alarm_control_panel: 'alarm_control_panel',
  sun: 'sun',
  weather: 'weather',
  remote: 'remote'
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    r = hue2rgb(h / 360 + 1 / 3)
    g = hue2rgb(h / 360)
    b = hue2rgb(h / 360 - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getDynamicIcon(device: Device): React.ReactElement {
  return getDynamicSvgIcon(device, 20)
}

export function ColorWheelPicker({ selectedHex, onChange }: { selectedHex: string; onChange: (rgb: [number, number, number], hex: string) => void }) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const [handlePos, setHandlePos] = useState<{ x: number; y: number }>({ x: 170, y: 170 })

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    const radius = rect.width / 2
    const dist = Math.min(radius - 12, Math.sqrt(x * x + y * y))

    const angle = Math.atan2(x, -y)
    const posX = centerX + dist * Math.sin(angle)
    const posY = centerY - dist * Math.cos(angle)
    setHandlePos({ x: posX, y: posY })

    let hue = (angle * (180 / Math.PI) + 360) % 360
    let sat = dist / (radius - 12)
    const rgb = hslToRgb(hue, sat, 0.5)
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2])
    onChange(rgb, hex)
  }

  return (
    <div
      ref={wheelRef}
      className="sh-color-wheel"
      style={{ WebkitAppRegion: 'no-drag' } as any}
      onPointerDown={handlePointer}
      onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e) }}
    >
      <div className="sh-color-wheel-handle" style={{ left: `${handlePos.x}px`, top: `${handlePos.y}px` }} />
    </div>
  )
}

export function DeviceControlCardContent({
  device,
  allDevices = [],
  onClose,
  onToggle,
  callServiceApi,
  isOverlay = false
}: {
  device: Device
  allDevices?: Device[]
  onClose: () => void
  onToggle?: (d: Device) => void
  callServiceApi?: (domain: string, service: string, data?: any, providerType?: string) => Promise<any>
  isOverlay?: boolean
}) {
  const [currentDevice, setCurrentDevice] = useState<Device>(device)

  React.useEffect(() => {
    setCurrentDevice(device)
  }, [device])

  const effectiveAllDevices = React.useMemo(() => {
    const list = [...(allDevices || [])]
    const rels = (currentDevice.attributes?.relatedEntities as Device[]) || (device.attributes?.relatedEntities as Device[]) || []
    for (const r of rels) {
      if (r && r.id && !list.some((d) => d.id === r.id)) {
        list.push(r)
      }
    }
    return list
  }, [allDevices, currentDevice, device])

  const volumeDevice = currentDevice.domain === 'media_player'
    ? currentDevice
    : (effectiveAllDevices.find((candidate) => candidate.domain === 'media_player' && (candidate.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim() || candidate.id === currentDevice.id)) || currentDevice)
  const [brightness, setBrightnessState] = useState<number>(currentDevice.state?.brightness ?? 94)
  const [tempPct, setTempPctState] = useState<number>(85)
  const [activeTab, setActiveTab] = useState<'brightness' | 'color' | 'temp'>('brightness')
  const [selectedRgbHex, setSelectedRgbHex] = useState<string>('#f97316')

  const [isOn, setIsOn] = useState<boolean>(Boolean(currentDevice.state?.on))
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [showInputSelector, setShowInputSelector] = useState<boolean>(false)
  const initialVolumePercent = volumeToPercent(volumeDevice.state?.volume)
  const [volumePercent, setVolumePercent] = useState<number>(initialVolumePercent)
  const volumePercentRef = useRef(initialVolumePercent)
  const [activeVolumeButton, setActiveVolumeButton] = useState<'down' | 'up' | null>(null)
  const volumeFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (currentDevice.state?.on !== undefined) {
      setIsOn(Boolean(currentDevice.state.on))
    }
    if (currentDevice.state?.brightness != null) {
      setBrightnessState(currentDevice.state.brightness)
    }
    if (currentDevice.state?.hexColor) {
      setSelectedRgbHex(currentDevice.state.hexColor)
    } else if (Array.isArray(currentDevice.state?.rgbColor) && currentDevice.state.rgbColor.length === 3) {
      const rgb = currentDevice.state.rgbColor
      const hex = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
      setSelectedRgbHex(hex)
    }
    if (currentDevice.state?.colorTempKelvin) {
      const pct = Math.max(0, Math.min(100, Math.round(((6500 - currentDevice.state.colorTempKelvin) / (6500 - 2000)) * 100)))
      setTempPctState(pct)
    }
    if (currentDevice.domain === 'media_player') {
      if (currentDevice.state?.isPlaying !== undefined) {
        setIsPlaying(currentDevice.state.isPlaying)
      } else if (currentDevice.state?.rawState) {
        setIsPlaying(currentDevice.state.rawState === 'playing')
      }
      if (currentDevice.state?.isMuted !== undefined) {
        setIsMuted(Boolean(currentDevice.state.isMuted))
      }
    }
  }, [currentDevice])

  React.useEffect(() => {
    if (volumeDevice.state?.volume === null || volumeDevice.state?.volume === undefined) return
    const nextVolumePercent = volumeToPercent(volumeDevice.state.volume)
    volumePercentRef.current = nextVolumePercent
    setVolumePercent(nextVolumePercent)
  }, [volumeDevice.state?.volume])

  React.useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      const sseUrl = `${getApiBaseUrl()}/extensions/events`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'extension_event' && payload.eventType === 'state_changed') {
            const updatedDevice: Device = payload.data?.device
            if (updatedDevice) {
              const isMatchCurrent = updatedDevice.id === currentDevice.id ||
                updatedDevice.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim()
              const isMatchVolume = updatedDevice.id === volumeDevice.id ||
                updatedDevice.name.toLowerCase().trim() === volumeDevice.name.toLowerCase().trim()

              if (isMatchCurrent) {
                setCurrentDevice((prev) => ({
                  ...prev,
                  ...updatedDevice,
                  state: { ...prev.state, ...updatedDevice.state },
                  attributes: { ...prev.attributes, ...updatedDevice.attributes }
                }))
              }
              if (isMatchVolume && updatedDevice.state?.volume !== undefined && updatedDevice.state.volume !== null) {
                const nextVol = volumeToPercent(updatedDevice.state.volume)
                setVolumePercent(nextVol)
                volumePercentRef.current = nextVol
              }
            }
          }
        } catch (err) {}
      }
    } catch (err) {}

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [currentDevice.id, currentDevice.name, volumeDevice.id, volumeDevice.name])

  React.useEffect(() => {
    return () => {
      if (volumeFeedbackTimerRef.current) {
        clearTimeout(volumeFeedbackTimerRef.current)
      }
    }
  }, [])

  const COLOR_PRESETS = [
    { name: 'Laranja Quente', color: '#f97316', rgb: [249, 115, 22] },
    { name: 'Âmbar Suave', color: '#fed7aa', rgb: [254, 215, 170] },
    { name: 'Branco Quente', color: '#fef3c7', rgb: [254, 243, 199] },
    { name: 'Branco Puro', color: '#ffffff', rgb: [255, 255, 255] },
    { name: 'Azul Gelo', color: '#60a5fa', rgb: [96, 165, 250] },
    { name: 'Roxo Suave', color: '#c084fc', rgb: [192, 132, 252] },
    { name: 'Rosa Pastel', color: '#f472b6', rgb: [244, 114, 182] },
    { name: 'Coral Vermelho', color: '#f87171', rgb: [248, 113, 113] }
  ]

  function getApiBaseUrl(): string {
    if (typeof window !== 'undefined' && (window as any).api?.getApiBaseUrl) {
      return (window as any).api.getApiBaseUrl()
    }
    return 'http://127.0.0.1:8050'
  }

  function getSessionToken(): string {
    if (typeof window !== 'undefined' && (window as any).api?.getSessionToken) {
      return (window as any).api.getSessionToken()
    }
    return ''
  }

  async function defaultCallService(domain: string, service: string, data: any = {}, providerType = 'homeassistant') {
    const baseUrl = getApiBaseUrl()
    const token = getSessionToken()
    try {
      const res = await fetch(`${baseUrl}/extensions/momaismarthome/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token
        },
        body: JSON.stringify({
          toolName: 'callService',
          args: { domain, service, data, providerType }
        })
      })
      return await res.json()
    } catch (err) {
      console.error('[DeviceControlContent] Erro ao chamar serviço:', err)
    }
  }

  const executeService = async (domain: string, service: string, data: any) => {
    if (callServiceApi) {
      const res = await callServiceApi(domain, service, data, 'homeassistant')
      if (res !== undefined) return res
    }
    const winApi = (window as any).api
    if (typeof winApi?.callService === 'function') {
      return winApi.callService(domain, service, data, 'homeassistant')
    }
    return defaultCallService(domain, service, data, 'homeassistant')
  }

  React.useEffect(() => {
    if (device.domain !== 'remote' && device.domain !== 'media_player') return

    let disposed = false
    let syncing = false

    const syncVolumeFromHomeAssistant = async () => {
      if (syncing) return
      syncing = true
      try {
        const response = await fetch(`${getApiBaseUrl()}/extensions/momaismarthome/command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': getSessionToken()
          },
          body: JSON.stringify({
            toolName: 'getDeviceState',
            args: { deviceId: volumeDevice.id, providerType: 'homeassistant' }
          })
        })
        if (!response.ok) return

        const result = await response.json()
        const refreshedDevice = result?.device as Device | null
        if (disposed || refreshedDevice?.state?.volume == null) return

        const nextVolumePercent = volumeToPercent(refreshedDevice.state.volume)
        volumePercentRef.current = nextVolumePercent
        setVolumePercent(nextVolumePercent)
      } catch {
        // The local value remains visible while Home Assistant is temporarily unavailable.
      } finally {
        syncing = false
      }
    }

    void syncVolumeFromHomeAssistant()
    const intervalId = window.setInterval(syncVolumeFromHomeAssistant, 1000)
    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [device.domain, volumeDevice.id, volumeDevice.name])

  const handleBrightnessChange = async (pct: number) => {
    setBrightnessState(pct)
    await executeService('light', 'turn_on', {
      entity_id: device.id,
      brightness_pct: pct
    })
  }

  const handleTempSliderChange = async (pct: number) => {
    setTempPctState(pct)
    const kelvinVal = Math.round(6500 - (pct / 100) * (6500 - 2000))
    await executeService('light', 'turn_on', {
      entity_id: device.id,
      color_temp_kelvin: kelvinVal
    })
  }

  const handleColorChange = async (rgb: [number, number, number], hex: string) => {
    setSelectedRgbHex(hex)
    await executeService('light', 'turn_on', {
      entity_id: device.id,
      rgb_color: rgb
    })
  }

  const handleToggle = () => {
    setIsOn(!isOn)
    if (onToggle) {
      onToggle(device)
    } else {
      executeService(device.domain || 'homeassistant', isOn ? 'turn_off' : 'turn_on', { entity_id: device.id })
    }
  }

  const handleSendRemoteCommand = async (command: string) => {
    const targetId = device.id
    const domain = device.domain
    const cmdUpper = command.toUpperCase()

    // 1. Tratamento de mídia padrão para reprodução
    if (cmdUpper === 'PLAY' || cmdUpper === 'PAUSE' || cmdUpper === 'PLAY_PAUSE') {
      await executeService('media_player', 'media_play_pause', { entity_id: targetId })
      return
    }
    if (cmdUpper === 'PREV' || cmdUpper === 'PREVIOUS') {
      await executeService('media_player', 'media_previous_track', { entity_id: targetId })
      return
    }
    if (cmdUpper === 'NEXT') {
      await executeService('media_player', 'media_next_track', { entity_id: targetId })
      return
    }

    // 2. Se a ação for um app (ex: YouTube ou Netflix)
    if (cmdUpper === 'YOUTUBE' || cmdUpper === 'NETFLIX') {
      const sourceName = cmdUpper === 'YOUTUBE' ? 'YouTube' : 'Netflix'
      const appId = cmdUpper === 'YOUTUBE' ? 'com.google.android.youtube.tv' : 'com.netflix.ninja'

      // 2a. Tentar media_player.play_media com o appId do Android TV
      try {
        const res = await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'app',
          media_content_id: appId
        })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}

      // 2b. Tentar remote.turn_on com activity no remote (ex: remote.tv_thucos)
      const candidateRemote = effectiveAllDevices.find(d => d.domain === 'remote')
      if (candidateRemote) {
        try {
          const res = await executeService('remote', 'turn_on', {
            entity_id: candidateRemote.id,
            activity: appId
          })
          if (res?.success !== false && res?.ok !== false) return
        } catch (e) {}
      }

      // 2c. Tentar media_player.select_source
      try {
        const res = await executeService('media_player', 'select_source', { entity_id: targetId, source: sourceName })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}
    }

    // 3. Suporte às Entradas TV, HDMI 1, HDMI 2, HDMI 3 e AV
    const inputActivityMap: Record<string, string> = {
      'TV': 'passthrough://media_0',
      'TV1': 'passthrough://media_0',
      'HDMI 1': 'passthrough://media_1',
      'HDMI1': 'passthrough://media_1',
      'HDMI 2': 'passthrough://media_2',
      'HDMI2': 'passthrough://media_2',
      'HDMI 3': 'passthrough://media_3',
      'HDMI3': 'passthrough://media_3',
      'AV': 'passthrough://media_av'
    }

    const isTvCmd = cmdUpper === 'TV' || cmdUpper === 'TV1' || cmdUpper === 'LIVE TV' || cmdUpper === 'TV AO VIVO'
    const isInputCmd = Boolean(inputActivityMap[cmdUpper]) || isTvCmd

    if (isInputCmd) {
      const act = inputActivityMap[cmdUpper] || 'passthrough://media_0'

      // 3a. Tentar media_player.select_source com a string exata do comando (ex: 'TV', 'HDMI 1', etc.)
      try {
        await executeService('media_player', 'select_source', { entity_id: targetId, source: command })
      } catch (e) {}

      // 3b. Se for comando de TV, procurar no source_list da entidade por termos equivalentes a TV ao vivo
      if (isTvCmd) {
        const sourceList = (device.attributes?.source_list as string[]) || (currentDevice.attributes?.source_list as string[]) || []
        const matchedSource = sourceList.find((s) => {
          const l = String(s).toLowerCase().trim()
          return l === 'tv' || l === 'live tv' || l === 'tv ao vivo' || l === 'dtv' || l === 'tv/dtv' || l === 'antenna' || l === 'tuner' || l === 'sintonizador'
        })
        if (matchedSource) {
          try {
            await executeService('media_player', 'select_source', { entity_id: targetId, source: matchedSource })
          } catch (e) {}
        }

        // Tentar app sintonizador de TV do TCL / Google TV / Android TV
        try {
          await executeService('media_player', 'play_media', {
            entity_id: targetId,
            media_content_type: 'app',
            media_content_id: 'com.tcl.tv'
          })
        } catch (e) {}
      }

      // 3c. Tentar media_player.play_media com a URI passthrough
      const chromecastMedia = effectiveAllDevices.find((d) => d.domain === 'media_player' && d.id !== targetId)
      const targetMediaId = chromecastMedia ? chromecastMedia.id : targetId

      try {
        await executeService('media_player', 'play_media', {
          entity_id: targetMediaId,
          media_content_type: 'app',
          media_content_id: act
        })
      } catch (e) {}

      try {
        await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'app',
          media_content_id: act
        })
      } catch (e) {}

      // 3d. Tentar remote.turn_on com a activity passthrough no controle remoto
      const candidateRemote = effectiveAllDevices.find((d) => d.domain === 'remote')
      if (candidateRemote) {
        try {
          await executeService('remote', 'turn_on', {
            entity_id: candidateRemote.id,
            activity: act
          })
        } catch (e) {}
      }

      // 3e. Tentar remote.send_command com comandos universais de entrada de TV
      const remoteTargetId = candidateRemote?.id || (domain === 'media_player' ? targetId.replace('media_player.', 'remote.') : null)
      if (remoteTargetId) {
        for (const inputCmd of ['TV_INPUT', 'INPUT', 'TV', 'LIVE_TV']) {
          try {
            await executeService('remote', 'send_command', {
              entity_id: remoteTargetId,
              command: [inputCmd]
            })
          } catch (e) {}
        }
      }

      return
    }

    // Mapeamento universal de comandos para Android TV
    const androidTvCommandMap: Record<string, string[]> = {
      UP: ['DPAD_UP', 'UP'],
      DOWN: ['DPAD_DOWN', 'DOWN'],
      LEFT: ['DPAD_LEFT', 'LEFT'],
      RIGHT: ['DPAD_RIGHT', 'RIGHT'],
      ENTER: ['DPAD_CENTER', 'ENTER', 'OK'],
      BACK: ['BACK'],
      HOME: ['HOME']
    }
    const candidates = androidTvCommandMap[cmdUpper] || [cmdUpper]

    // 4. Tentar remote.send_command na própria entidade ou em entidade remote correspondente (ex: remote.tv_thucos)
    const candidateRemote = effectiveAllDevices.find(d => d.domain === 'remote')

    const remoteTargetId = domain === 'remote'
      ? targetId
      : (candidateRemote?.id || (domain === 'media_player' ? targetId.replace('media_player.', 'remote.') : null))

    if (remoteTargetId) {
      for (const cmdCandidate of candidates) {
        try {
          const res = await executeService('remote', 'send_command', {
            entity_id: remoteTargetId,
            command: [cmdCandidate]
          })
          if (res?.success !== false && res?.ok !== false) return
        } catch (err) {}
      }
    }

    // 4. Se a TV for um media_player do Android TV / Chromecast (media_player.play_media com chave 'action' ou 'key')
    for (const cmdCandidate of candidates) {
      try {
        const res = await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'action',
          media_content_id: cmdCandidate
        })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}

      try {
        const res = await executeService('media_player', 'play_media', {
          entity_id: targetId,
          media_content_type: 'key',
          media_content_id: cmdCandidate
        })
        if (res?.success !== false && res?.ok !== false) return
      } catch (e) {}
    }

    // 5. Fallback final via remote.send_command no ID da própria entidade media_player (usado por algumas integrações do HA)
    for (const cmdCandidate of candidates) {
      try {
        await executeService('remote', 'send_command', {
          entity_id: targetId,
          command: [cmdCandidate]
        })
        return
      } catch (e) {}
    }
  }

  const handleSelectSource = async (source: string) => {
    setShowInputSelector(false)
    await handleSendRemoteCommand(source)
  }

  const handleVolumeChange = async (direction: 'down' | 'up') => {
    const nextVolumePercent = Math.max(0, Math.min(100, volumePercentRef.current + (direction === 'up' ? 10 : -10)))
    volumePercentRef.current = nextVolumePercent
    setVolumePercent(nextVolumePercent)
    setActiveVolumeButton(direction)

    if (volumeFeedbackTimerRef.current) {
      clearTimeout(volumeFeedbackTimerRef.current)
    }
    volumeFeedbackTimerRef.current = setTimeout(() => setActiveVolumeButton(null), 1200)

    await executeService('media_player', direction === 'up' ? 'volume_up' : 'volume_down', { entity_id: volumeDevice.id })
  }

  const currentDynamicIcon = getDynamicSvgIcon(device, 20, '#ffffff')

  if (device.domain === 'remote' || device.domain === 'media_player') {
    const rawSources = (device.attributes?.source_list as string[]) || (currentDevice.attributes?.source_list as string[])
    const defaultSources = ['TV', 'HDMI 1', 'HDMI 2', 'AV']
    const baseSources = (Array.isArray(rawSources) && rawSources.length > 0) ? rawSources : defaultSources
    // Filtrar YouTube e Netflix pois já existe o botão de atalho dedicado do YouTube na barra principal
    const inputSources = baseSources.filter(s => {
      const lower = s.toLowerCase().trim()
      return lower !== 'youtube' && lower !== 'netflix'
    })

    return (
      <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
        <button
          className="sh-modal-close-btn"
          title="Fechar"
          aria-label="Fechar controle"
          onClick={(e) => {
            e.stopPropagation()
            if (onClose) onClose()
          }}
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
        >
          ✕
        </button>
        <div className="sh-modal-remote-content">
          <div className="sh-remote-header">
            <span className="sh-remote-pill-tag">Smart Remote</span>
            <h3 className="sh-remote-title">{device.name}</h3>
            <p className="sh-remote-state">{isOn ? '● Ligado' : '○ Desligado'} • {device.room || 'Sala'}</p>
          </div>

          <div className="sh-dpad-ring" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-dpad-btn up" title="Navegar para cima" aria-label="Navegar para cima" onClick={() => handleSendRemoteCommand('UP')}>▲</button>
            <button className="sh-dpad-btn down" title="Navegar para baixo" aria-label="Navegar para baixo" onClick={() => handleSendRemoteCommand('DOWN')}>▼</button>
            <button className="sh-dpad-btn left" title="Navegar para esquerda" aria-label="Navegar para esquerda" onClick={() => handleSendRemoteCommand('LEFT')}>◀</button>
            <button className="sh-dpad-btn right" title="Navegar para direita" aria-label="Navegar para direita" onClick={() => handleSendRemoteCommand('RIGHT')}>▶</button>
            <button className="sh-dpad-center" title="Confirmar / OK" aria-label="Confirmar / OK" onClick={() => handleSendRemoteCommand('ENTER')}>OK</button>
          </div>

          <div className="sh-remote-actions-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-remote-action-btn" title="Voltar" aria-label="Voltar" onClick={() => handleSendRemoteCommand('BACK')}>
              <SvgBack size={18} />
            </button>
            <button className="sh-remote-action-btn" title="Menu Início (Home)" aria-label="Menu Início (Home)" onClick={() => handleSendRemoteCommand('HOME')}>
              <SvgHome size={18} />
            </button>
            <button className={`sh-remote-action-btn ${showInputSelector ? 'active' : ''}`} title="Entradas de vídeo (Outputs / HDMI / TV)" aria-label="Entradas de vídeo (Outputs / HDMI / TV)" onClick={() => setShowInputSelector(!showInputSelector)}>
              <SvgTv size={18} />
            </button>
            <button className="sh-remote-action-btn youtube-pill" title="Abrir YouTube" aria-label="Abrir YouTube" onClick={() => handleSendRemoteCommand('YOUTUBE')}>
              <SvgYoutube />
            </button>
            <button className={`sh-remote-action-btn power ${isOn ? 'active' : ''}`} title={isOn ? 'Desligar TV' : 'Ligar TV'} aria-label={isOn ? 'Desligar TV' : 'Ligar TV'} onClick={handleToggle}>
              <SvgPower size={18} color="#ffffff" />
            </button>
          </div>

          {showInputSelector && (
            <div className="sh-input-selector-popover" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
              <div className="sh-input-grid">
                {inputSources.map((src) => (
                  <button key={src} className="sh-input-chip" title={`Alternar para entrada ${src}`} aria-label={`Alternar para entrada ${src}`} onClick={() => handleSelectSource(src)}>
                    <SvgTv size={14} /> {src}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sh-remote-media-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button className="sh-remote-icon-btn" title="Faixa anterior / Voltar mídia" aria-label="Faixa anterior / Voltar mídia" onClick={() => handleSendRemoteCommand('PREV')}>
              <SvgPrev size={18} />
            </button>
            <button
              className="sh-remote-icon-btn main"
              title={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
              aria-label={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
              onClick={() => {
                setIsPlaying(!isPlaying)
                handleSendRemoteCommand(isPlaying ? 'PAUSE' : 'PLAY')
              }}
            >
              {isPlaying ? <SvgPause size={18} color="#ffffff" /> : <SvgPlay size={18} color="#ffffff" />}
            </button>
            <button className="sh-remote-icon-btn" title="Próxima faixa / Avançar mídia" aria-label="Próxima faixa / Avançar mídia" onClick={() => handleSendRemoteCommand('NEXT')}>
              <SvgNext size={18} />
            </button>
          </div>

          <div className="sh-remote-vol-row" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <button
              className="sh-remote-icon-btn"
              title={isMuted ? 'Restaurar som (Desmudar)' : 'Silenciar (Mudo)'}
              aria-label={isMuted ? 'Restaurar som (Desmudar)' : 'Silenciar (Mudo)'}
              onClick={() => {
                setIsMuted(!isMuted)
                executeService('media_player', 'volume_mute', { entity_id: device.id, is_volume_muted: !isMuted })
              }}
            >
              {isMuted ? <SvgMuteStrikethrough size={18} /> : <SvgMute size={18} />}
            </button>
            <div className="sh-volume-control">
              <span
                className={`sh-volume-feedback ${activeVolumeButton === 'down' ? 'active' : ''}`}
                aria-live="polite"
              >
                {volumePercent}%
              </span>
              <button
                className="sh-remote-icon-btn"
                title="Diminuir volume"
                aria-label="Diminuir volume"
                onClick={() => handleVolumeChange('down')}
              >
                <SvgVolDown size={18} />
              </button>
            </div>
            <div className="sh-volume-control">
              <span
                className={`sh-volume-feedback ${activeVolumeButton === 'up' ? 'active' : ''}`}
                aria-live="polite"
              >
                {volumePercent}%
              </span>
              <button
                className="sh-remote-icon-btn"
                title="Aumentar volume"
                aria-label="Aumentar volume"
                onClick={() => handleVolumeChange('up')}
              >
                <SvgVolUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (device.domain === 'light') {
    return (
      <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
        <button
          className="sh-modal-close-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (onClose) onClose()
          }}
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
        >
          ✕
        </button>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.5px' }}>
            {device.room || 'Cômodo'}
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{device.name}</h2>
        </div>

        <div className="sh-light-readout">{isOn ? `${brightness}%` : 'Off'}</div>
        <div className="sh-light-subreadout">{isOn ? 'Luz ligada' : 'Luz desligada'}</div>

        {activeTab === 'brightness' && (
          <div
            className="sh-pill-slider-container"
            style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickY = e.clientY - rect.top
              const pct = Math.max(0, Math.min(100, Math.round(((rect.height - clickY) / rect.height) * 100)))
              handleBrightnessChange(pct)
            }}
          >
            <div
              className="sh-pill-slider-fill"
              style={{
                height: `${brightness}%`,
                background: isOn ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : '#334155'
              }}
            >
              <div className="sh-pill-handle" />
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
            <ColorWheelPicker selectedHex={selectedRgbHex} onChange={handleColorChange} />
            <div className="sh-color-grid">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className="sh-color-circle"
                  style={{ background: preset.color }}
                  onClick={() => handleColorChange(preset.rgb as [number, number, number], preset.color)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'temp' && (
          <div
            className="sh-pill-slider-container"
            style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickY = e.clientY - rect.top
              const pct = Math.max(0, Math.min(100, Math.round(((rect.height - clickY) / rect.height) * 100)))
              handleTempSliderChange(pct)
            }}
          >
            <div
              className="sh-pill-slider-fill"
              style={{
                height: `${tempPct}%`,
                background: 'linear-gradient(to top, #ffffff 0%, #ffdfb8 40%, #ff8c00 100%)'
              }}
            >
              <div className="sh-pill-handle" />
            </div>
          </div>
        )}

        <div className="sh-light-ctrl-bar" style={isOverlay ? { WebkitAppRegion: 'no-drag' } as any : undefined}>
          <button className={`sh-light-ctrl-btn ${activeTab === 'brightness' ? 'active' : ''}`} onClick={() => setActiveTab('brightness')}>
            <SvgSun size={20} />
          </button>
          <button className={`sh-light-ctrl-btn ${activeTab === 'color' ? 'active' : ''}`} onClick={() => setActiveTab('color')}>
            <SvgColorWheel size={22} />
          </button>
          <button className={`sh-light-ctrl-btn ${activeTab === 'temp' ? 'active' : ''}`} onClick={() => setActiveTab('temp')}>
            <SvgTemp size={22} />
          </button>
          <button className={`sh-light-ctrl-btn ${isOn ? 'active' : ''}`} onClick={handleToggle} style={isOn ? { background: '#ef4444', color: '#fff' } : undefined}>
            <SvgPower size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sh-modal-detail" style={isOverlay ? { WebkitAppRegion: 'drag' } as any : undefined}>
      <button
        className="sh-modal-close-btn"
        onClick={(e) => {
          e.stopPropagation()
          if (onClose) onClose()
        }}
        style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto', cursor: 'pointer' } as any}
      >
        ✕
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="sh-icon" style={{ width: '60px', height: '60px', borderRadius: '18px', margin: '0 auto 12px', fontSize: '28px' }}>
          {currentDynamicIcon}
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{device.name}</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          {device.room ? `${device.room} • ` : ''}{DOMAIN_LABELS[device.domain] || device.domain}
        </p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Status do Dispositivo</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isOn ? '#34d399' : '#f87171' }}>
            {isOn ? 'Ativo / Ligado' : 'Inativo / Desligado'}
          </span>
        </div>
        {device.state?.temperature != null && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Temperatura</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>{device.state.temperature}°C</span>
          </div>
        )}
        {device.state?.humidity != null && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Umidade</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>{device.state.humidity}%</span>
          </div>
        )}
        {device.state?.value && (
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Valor</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{device.state.value} {device.state.unit || ''}</span>
          </div>
        )}
      </div>

      {CONTROLLABLE_DOMAINS.includes(device.domain) && (
        <button
          className="sh-btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '15px' }}
          onClick={handleToggle}
        >
          <SvgPower size={18} color="#ffffff" />
          {isOn ? 'Desligar Dispositivo' : 'Ligar Dispositivo'}
        </button>
      )}
    </div>
  )
}
