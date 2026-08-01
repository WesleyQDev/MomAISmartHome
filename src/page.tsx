import React, { useState, useEffect, useRef } from 'react'
import { DeviceControlCardContent } from './components/DeviceControlContent'
import { SmartHomeStyles } from './styles'
import {
  SvgHome,
  SvgSmartHomeLogo,
  SvgWifi,
  SvgLight,
  SvgSwitch,
  SvgFan,
  SvgCover,
  SvgLock,
  SvgUnlock,
  SvgClimate,
  SvgSensor,
  SvgBinarySensor,
  SvgTv,
  SvgCamera,
  SvgVacuum,
  SvgScene,
  SvgAutomation,
  SvgAlarm,
  SvgSun,
  SvgMoon,
  SvgWeather,
  SvgRemote,
  SvgDrop,
  SvgBattery,
  SvgZap,
  SvgGauge,
  SvgMotion,
  SvgDoor,
  SvgClock,
  SvgWind,
  SvgAlert,
  SvgSignal,
  SvgSunrise,
  SvgSunset,
  SvgPlus,
  SvgCheck,
  SvgClose,
  SvgRefresh,
  SvgLogout,
  SvgPlay,
  SvgPause,
  SvgPrev,
  SvgNext,
  SvgMute,
  SvgMuteStrikethrough,
  SvgVolDown,
  SvgVolUp,
  SvgPower,
  SvgBack,
  SvgYoutube,
  getDomainSvgIcon,
  getDynamicSvgIcon,
  getWeatherSvgIcon
} from './components/SvgIcons'

interface EntityState {
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

interface EntityAttributes {
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

interface Device {
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

interface Connection {
  id: string
  provider_type: string
  name: string
  user_email: string
  updated_at: string
}

const DOMAIN_LABELS: Record<string, string> = {
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

const CONTROLLABLE_DOMAINS = [
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

interface BackendApi {
  connectToHomeAssistant(url: string, token: string, name?: string): Promise<any>
  getDevices(connectionId?: string): Promise<Device[]>
  syncDevices(connectionId?: string): Promise<Device[]>
  turnOnDevice(deviceId: string, providerType?: string, params?: Record<string, unknown>): Promise<any>
  turnOffDevice(deviceId: string, providerType?: string, params?: Record<string, unknown>): Promise<any>
  setClimate(deviceId: string, temperature?: number, hvacMode?: string, providerType?: string): Promise<any>
  callService(domain: string, service: string, data?: any, providerType?: string): Promise<any>
  listConnections(): Promise<Connection[]>
  disconnectAll(): Promise<any>
  removeConnection(connectionId: string): Promise<any>
  getStatus(): Promise<any>
  getLastConnection(): Promise<any>
}

const EXT_ID = 'momaismarthome'

function getApiBase(): string {
  return (typeof window !== 'undefined' && (window as any).api?.getApiBaseUrl?.()) || 'http://127.0.0.1:8050'
}

function getSessionToken(): string {
  return (typeof window !== 'undefined' && (window as any).api?.getSessionToken?.()) || ''
}

function extFetch(path: string, body?: any): Promise<any> {
  return fetch(`${getApiBase()}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: body ? JSON.stringify(body) : undefined
  }).then((r) => r.json())
}

async function sendCommand(toolName: string, args: any = {}): Promise<any> {
  const res = await extFetch(`/extensions/${EXT_ID}/command`, { toolName, args })
  return res
}

const api: BackendApi = {
  connectToHomeAssistant: (url, token, name) => sendCommand('connectToHomeAssistant', { url, token, name }),
  getDevices: (connectionId?) => sendCommand('getDevices', { connectionId }).then((r: any) => r.devices || []),
  syncDevices: (connectionId?) => sendCommand('syncDevices', { connectionId }).then((r: any) => r.devices || []),
  turnOnDevice: (deviceId, providerType?, params?) => sendCommand('turnOnDevice', { deviceId, providerType, params }),
  turnOffDevice: (deviceId, providerType?, params?) => sendCommand('turnOffDevice', { deviceId, providerType, params }),
  setClimate: (deviceId, temperature, hvacMode, providerType?) => sendCommand('setClimate', { deviceId, temperature, hvacMode, providerType }),
  callService: (domain, service, data, providerType) => sendCommand('callService', { domain, service, data, providerType: providerType || 'homeassistant' }),
  listConnections: () => sendCommand('listConnections').then((r: any) => r.connections || []),
  disconnectAll: () => sendCommand('disconnectAll'),
  removeConnection: (connectionId) => sendCommand('removeConnection', { connectionId }),
  getStatus: () => sendCommand('getStatus'),
  getLastConnection: () => sendCommand('getLastConnection')
}

function deduplicateDevicesByName(rawDevices: Device[]): Device[] {
  const map = new Map<string, Device[]>()

  for (const d of rawDevices) {
    const key = d.name.toLowerCase().trim()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }

  const result: Device[] = []

  for (const group of map.values()) {
    if (group.length === 1) {
      result.push(group[0])
    } else {
      const primary = group.find((d) => (d.domain === 'media_player' || d.domain === 'light' || d.domain === 'climate') && d.online && d.state.rawState !== 'unavailable') || group.find((d) => d.domain === 'remote') || group[0]
      const mergedDevice: Device = {
        ...primary,
        attributes: {
          ...primary.attributes,
          relatedEntities: group
        }
      }
      result.push(mergedDevice)
    }
  }

  return result
}

function formatEntityValue(value?: string | number | null, unit?: string, deviceClass?: string): { primary: string; secondary?: string } {
  if (value == null || value === '') return { primary: '--' }

  const str = String(value).trim()

  const isIsoDate = deviceClass === 'timestamp' || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)
  if (isIsoDate) {
    try {
      const d = new Date(str)
      if (!isNaN(d.getTime())) {
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
        return { primary: timeStr, secondary: dateStr }
      }
    } catch {}
  }

  if (str === 'on' || str === 'home' || str === 'open') return { primary: 'Ativo' }
  if (str === 'off' || str === 'away' || str === 'closed') return { primary: 'Inativo' }
  if (str === 'unavailable' || str === 'unknown') return { primary: 'Indisponível' }

  if (unit) {
    return { primary: `${str} ${unit}` }
  }

  return { primary: str }
}

function DeviceControlModal({ device, allDevices, onClose, onToggle }: { device: Device; allDevices: Device[]; onClose: () => void; onToggle: (d: Device) => void }) {
  return (
    <div className="sh-modal-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <DeviceControlCardContent
          device={device}
          allDevices={allDevices}
          onClose={onClose}
          onToggle={onToggle}
          callServiceApi={(domain, service, data, providerType) => api.callService(domain, service, data, providerType)}
          isOverlay={false}
        />
      </div>
    </div>
  )
}

function LiveClockWidget({ activeDevicesCount, totalDevicesCount }: { activeDevicesCount: number; totalDevicesCount: number }) {
  const [timeStr, setTimeStr] = useState<string>('')
  const [dateStr, setDateStr] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      const formattedDate = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      setDateStr(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="sh-clock-card">
      <div className="sh-clock-time">{timeStr || '--:--'}</div>
      <div className="sh-clock-date">
        <SvgClock size={14} color="#38bdf8" />
        <span>{dateStr}</span>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeDevicesCount > 0 ? '#10b981' : '#64748b' }} />
        <span>{activeDevicesCount} de {totalDevicesCount} dispositivos ligados</span>
      </div>
    </div>
  )
}

function SunWidget({ device }: { device: Device }) {
  const isAbove = device.state.rawState === 'above_horizon'
  const elevation = device.state.elevation ?? 0
  const formatTime = (iso?: string) => {
    if (!iso) return '--:--'
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }

  const nextRising = formatTime(device.attributes.next_rising)
  const nextSetting = formatTime(device.attributes.next_setting)

  return (
    <div className="sh-sun-widget">
      <div className="sh-sun-header">
        <div className="sh-sun-badge">
          {isAbove ? <SvgSun size={18} color="#fbbf24" /> : <SvgMoon size={18} color="#38bdf8" />}
          <span>{isAbove ? 'Dia (Acima do Horizonte)' : 'Noite (Abaixo do Horizonte)'}</span>
        </div>
        <span className="sh-sun-elevation">{elevation}°</span>
      </div>

      <div className="sh-sun-arc-container">
        <svg className="sh-sun-arc-svg" viewBox="0 0 200 90">
          <path d="M 10 80 A 90 90 0 0 1 190 80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeDasharray="4 4" />
          <path
            d="M 10 80 A 90 90 0 0 1 190 80"
            fill="none"
            stroke={isAbove ? '#fbbf24' : '#38bdf8'}
            strokeWidth="3"
            strokeDasharray="280"
            strokeDashoffset={isAbove ? Math.max(0, 140 - (elevation * 2)) : 220}
          />
          <circle
            cx={isAbove ? Math.min(170, Math.max(30, 100 + (elevation * 0.8))) : 100}
            cy={isAbove ? Math.max(20, 80 - (elevation * 0.7)) : 75}
            r="8"
            fill={isAbove ? '#f59e0b' : '#0284c7'}
          />
          <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="sh-sun-times">
        <div className="sh-sun-time-box">
          <span className="sh-sun-time-label">
            <SvgSunrise size={13} color="#fbbf24" /> Nascer
          </span>
          <span className="sh-sun-time-val">{nextRising}</span>
        </div>
        <div className="sh-sun-time-box">
          <span className="sh-sun-time-label">
            <SvgSunset size={13} color="#f97316" /> Pôr do Sol
          </span>
          <span className="sh-sun-time-val">{nextSetting}</span>
        </div>
      </div>
    </div>
  )
}

function WeatherWidget({ device }: { device: Device }) {
  const state = device.state.rawState || 'desconhecido'
  const temp = device.state.temperature
  const humidity = device.state.humidity
  const pressure = device.state.pressure
  const wind = device.state.windSpeed

  return (
    <div className="sh-weather-widget">
      <div className="sh-weather-main">
        <div className="sh-weather-icon">{getWeatherSvgIcon(state, 24, '#38bdf8')}</div>
        <div>
          <h3 className="sh-weather-name">{device.name}</h3>
          <p className="sh-weather-state">{state.replace('-', ' ').toUpperCase()}</p>
        </div>
        {temp != null && <div className="sh-weather-temp">{temp}°C</div>}
      </div>

      <div className="sh-weather-details">
        {humidity != null && (
          <div className="sh-weather-detail">
            <span className="sh-weather-detail-label">
              <SvgDrop size={11} color="#38bdf8" /> Umidade
            </span>
            <strong>{humidity}%</strong>
          </div>
        )}
        {pressure != null && (
          <div className="sh-weather-detail">
            <span className="sh-weather-detail-label">
              <SvgGauge size={11} color="#38bdf8" /> Pressão
            </span>
            <strong>{pressure} hPa</strong>
          </div>
        )}
        {wind != null && (
          <div className="sh-weather-detail">
            <span className="sh-weather-detail-label">
              <SvgWind size={11} color="#38bdf8" /> Vento
            </span>
            <strong>{wind} km/h</strong>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SmartHomePage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  // Single filter state: 'controllable' | 'sensors' | room name
  const [activeFilter, setActiveFilter] = useState<string>('controllable')

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [haUrl, setHaUrl] = useState('')
  const [haToken, setHaToken] = useState('')
  const [connectError, setConnectError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  // Auto-sync every 10s to discover new devices added in Home Assistant
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(async () => {
      try {
        const devs = await api.getDevices()
        if (Array.isArray(devs)) {
          const deduplicated = deduplicateDevicesByName(devs)
          setDevices(deduplicated)
        }
      } catch (err) {
        console.warn('[SmartHome] Erro na sincronização periódica:', err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Listen for real-time state_changed events via SSE stream
  useEffect(() => {
    if (!isConnected) return

    let eventSource: EventSource | null = null

    try {
      const sseUrl = `${getApiBase()}/extensions/events`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'extension_event' && payload.eventType === 'state_changed') {
            const updatedDevice: Device = payload.data?.device
            if (updatedDevice && updatedDevice.id) {
              setDevices((prevDevices) => {
                const index = prevDevices.findIndex((d) => d.id === updatedDevice.id)
                if (index >= 0) {
                  const updated = [...prevDevices]
                  updated[index] = {
                    ...updated[index],
                    ...updatedDevice,
                    state: { ...updated[index].state, ...updatedDevice.state },
                    attributes: { ...updated[index].attributes, ...updatedDevice.attributes }
                  }
                  return updated
                } else {
                  return deduplicateDevicesByName([...prevDevices, updatedDevice])
                }
              })

              setSelectedDevice((prevSelected) => {
                if (prevSelected && prevSelected.id === updatedDevice.id) {
                  return {
                    ...prevSelected,
                    ...updatedDevice,
                    state: { ...prevSelected.state, ...updatedDevice.state },
                    attributes: { ...prevSelected.attributes, ...updatedDevice.attributes }
                  }
                }
                return prevSelected
              })
            }
          }
        } catch (err) {
          console.warn('[SmartHome] Erro ao processar evento SSE:', err)
        }
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao conectar ao EventSource SSE:', err)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [isConnected])

  const handleResync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const devs = await api.syncDevices()
      const deduplicated = deduplicateDevicesByName(devs)
      setDevices(deduplicated)
    } catch (err) {
      console.warn('[SmartHome] Erro na resincronização manual:', err)
    } finally {
      setIsSyncing(false)
    }
  }

  const fetchLastConnection = async () => {
    try {
      const last = await api.getLastConnection()
      if (last && (last.url || last.token)) {
        if (last.url) setHaUrl(last.url)
        if (last.token) setHaToken(last.token)
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao buscar última conexão:', err)
    }
  }

  const loadStatus = async () => {
    setLoading(true)
    try {
      const status = await api.getStatus()
      setIsConnected(Boolean(status.connected && status.connections?.length > 0))
      const conns = await api.listConnections()
      setConnections(conns)
      await fetchLastConnection()

      if (status.connected && conns.length > 0) {
        const devs = await api.getDevices()
        const deduplicated = deduplicateDevicesByName(devs)
        setDevices(deduplicated)
      } else {
        setIsConnected(false)
        setDevices([])
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao carregar status:', err)
    }
    setLoading(false)
  }

  const openConnectModal = async () => {
    setShowConnectModal(true)
    await fetchLastConnection()
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!haUrl.trim() || !haToken.trim()) return

    setConnecting(true)
    setConnectError(null)
    try {
      const result = await api.connectToHomeAssistant(haUrl.trim(), haToken.trim())
      if (result.success || result.ok) {
        setShowConnectModal(false)
        await loadStatus()
      } else {
        setConnectError(result.message || result.error || 'Falha ao conectar')
      }
    } catch (err: any) {
      setConnectError(err.message || 'Erro ao conectar')
    }
    setConnecting(false)
  }

  const handleDisconnectAll = async () => {
    try {
      setLoading(true)
      setIsConnected(false)
      setDevices([])
      setConnections([])
      await api.disconnectAll().catch(() => {})
      const conns = await api.listConnections().catch(() => [])
      for (const c of conns) {
        await api.removeConnection(c.id).catch(() => {})
      }
      await fetchLastConnection()
      setShowConnectModal(true)
    } catch (err) {
      console.warn('[SmartHome] Erro ao desconectar:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDevice = async (device: Device) => {
    const providerType = device.provider?.toLowerCase().replace(/\s+/g, '') || 'homeassistant'
    const related = (device.attributes.relatedEntities as Device[]) || [device]

    for (const target of related) {
      if (device.state.on) {
        await api.turnOffDevice(target.id, providerType)
      } else {
        await api.turnOnDevice(target.id, providerType)
      }
    }

    setDevices((prev) =>
      prev.map((d) =>
        d.name.toLowerCase().trim() === device.name.toLowerCase().trim()
          ? { ...d, state: { ...d.state, on: !device.state.on } }
          : d
      )
    )
    if (selectedDevice?.name.toLowerCase().trim() === device.name.toLowerCase().trim()) {
      setSelectedDevice((prev) => (prev ? { ...prev, state: { ...prev.state, on: !prev.state.on } } : null))
    }
  }

  const setBrightness = async (device: Device, brightness: number) => {
    const result = await api.turnOnDevice(device.id, device.provider?.toLowerCase().replace(/\s+/g, '') || 'homeassistant', { brightness })
    if (result?.ok === false || result?.success === false) return
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, state: { ...d.state, brightness } } : d)))
  }

  const adjustTemp = async (device: Device, delta: number) => {
    const newTemp = Math.min(30, Math.max(16, (device.state.targetTemperature || 22) + delta))
    const result = await api.setClimate(device.id, newTemp, undefined, device.provider?.toLowerCase().replace(/\s+/g, '') || 'homeassistant')
    if (result?.ok === false || result?.success === false) return
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, state: { ...d.state, targetTemperature: newTemp } } : d))
    )
  }

  const rooms = [...new Set(devices.map((d) => d.room).filter(Boolean))]

  const filteredDevices = devices.filter((d) => {
    if (activeFilter === 'controllable') return CONTROLLABLE_DOMAINS.includes(d.domain)
    if (activeFilter === 'sensors') return !CONTROLLABLE_DOMAINS.includes(d.domain)
    if (rooms.includes(activeFilter)) return d.room === activeFilter
    return d.domain === activeFilter
  })

  const sunDevice = devices.find((d) => d.domain === 'sun')
  const weatherDevice = devices.find((d) => d.domain === 'weather')
  const activeDevicesTotal = devices.filter((d) => d.state.on).length

  const controllableCount = devices.filter((d) => CONTROLLABLE_DOMAINS.includes(d.domain)).length
  const sensorsCount = devices.filter((d) => !CONTROLLABLE_DOMAINS.includes(d.domain)).length

  return (
    <div className="sh-root">
      <SmartHomeStyles />

      {showConnectModal && (
        <div className="sh-modal-overlay">
          <div className="sh-modal">
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
              Conectar ao Home Assistant
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
              Informe a URL do seu servidor Home Assistant e um Long-Lived Access Token.
            </p>
            <form onSubmit={handleConnect}>
              <label className="sh-label">URL do Home Assistant</label>
              <input className="sh-input" type="url" required placeholder="http://homeassistant.local:8123" value={haUrl} onChange={(e) => setHaUrl(e.target.value)} />
              <label className="sh-label">Long-Lived Access Token</label>
              <input className="sh-input" type="password" required placeholder="eyJhbGciOiJIUzI1NiIs..." value={haToken} onChange={(e) => setHaToken(e.target.value)} />
              {connectError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>{connectError}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="sh-btn" onClick={() => { setShowConnectModal(false); setConnectError(null) }}>Cancelar</button>
                <button type="submit" className="sh-btn-primary" disabled={connecting}>
                  {connecting ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDevice && (
        <DeviceControlModal
          device={selectedDevice}
          allDevices={devices}
          onClose={() => setSelectedDevice(null)}
          onToggle={toggleDevice}
        />
      )}

      {loading ? (
        <div className="sh-auth"><p style={{ color: '#94a3b8' }}>Carregando...</p></div>
      ) : !isConnected ? (
        <div className="sh-auth">
          <div className="sh-auth-card">
            {/* Left Column: Branding & Features */}
            <div className="sh-auth-left">
              <div className="sh-auth-icon">
                <SvgSmartHomeLogo size={32} color="#c084fc" />
              </div>
              <h2 className="sh-auth-title">Home Assistant</h2>
              <p className="sh-auth-sub">
                Conecte seus dispositivos inteligentes ao MomAI informando o endereço do seu servidor local ou remoto.
              </p>

              <div className="sh-auth-feats-grid">
                <div className="sh-auth-feat-item">
                  <div className="sh-auth-feat-icon-box"><SvgLight size={14} /></div>
                  <span>Iluminação & RGB</span>
                </div>
                <div className="sh-auth-feat-item">
                  <div className="sh-auth-feat-icon-box"><SvgClimate size={14} /></div>
                  <span>Climatização</span>
                </div>
                <div className="sh-auth-feat-item">
                  <div className="sh-auth-feat-icon-box"><SvgLock size={14} /></div>
                  <span>Fechaduras & Sensores</span>
                </div>
                <div className="sh-auth-feat-item">
                  <div className="sh-auth-feat-icon-box"><SvgTv size={14} /></div>
                  <span>Mídia & Smart TVs</span>
                </div>
              </div>
            </div>

            {/* Right Column: Connection Form */}
            <form onSubmit={handleConnect} className="sh-auth-form">
              <div className="sh-auth-input-group">
                <label className="sh-auth-label">
                  <SvgWifi size={13} color="#c084fc" />
                  URL do Servidor
                </label>
                <input
                  className="sh-auth-input"
                  type="url"
                  required
                  placeholder="http://homeassistant.local:8123"
                  value={haUrl}
                  onChange={(e) => setHaUrl(e.target.value)}
                />
              </div>

              <div className="sh-auth-input-group">
                <label className="sh-auth-label">
                  <SvgLock size={13} color="#c084fc" />
                  Long-Lived Access Token
                </label>
                <input
                  className="sh-auth-input"
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={haToken}
                  onChange={(e) => setHaToken(e.target.value)}
                />
              </div>

              {connectError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '8px 12px', color: '#fca5a5', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SvgAlert size={15} color="#ef4444" />
                  <span>{connectError}</span>
                </div>
              )}

              <button className="sh-btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: '13.5px', marginTop: '4px' }} type="submit" disabled={connecting}>
                {connecting ? (
                  <span>Conectando...</span>
                ) : (
                  <>
                    <SvgPlus size={15} color="#ffffff" />
                    <span>Conectar ao Home Assistant</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Header: Home Assistant Status & Disconnect Action */}
          <div className="sh-header">
            <div className="sh-header-left">
              <div className="sh-logo-icon">
                <SvgSmartHomeLogo size={22} color="#a78bfa" />
              </div>
              <div>
                <h1 className="sh-title">MomAI Smart Home</h1>
              </div>
            </div>

            <div className="sh-actions">
              <button
                className="sh-btn"
                onClick={handleResync}
                disabled={isSyncing}
                title="Resincronizar dispositivos do Home Assistant"
                style={{
                  background: 'rgba(167, 139, 250, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  cursor: isSyncing ? 'wait' : 'pointer'
                }}
              >
                <SvgRefresh size={15} className={isSyncing ? 'sh-spin' : ''} />
                <span>{isSyncing ? 'Sincronizando...' : 'Resincronizar'}</span>
              </button>

              <div className="sh-badge">
                <span className="sh-dot" />
                <span>Home Assistant</span>
              </div>

              <button className="sh-btn sh-btn-danger" onClick={handleDisconnectAll}>
                <SvgLogout size={15} />
                Desconectar
              </button>
            </div>
          </div>

          {/* Filter Bar right at top */}
          {devices.length > 0 && (
            <div className="sh-chips">
              <button
                className={`sh-chip ${activeFilter === 'controllable' ? 'active' : ''}`}
                onClick={() => setActiveFilter('controllable')}
              >
                <SvgZap size={15} />
                <span>Controláveis</span>
                <span style={{ opacity: 0.7 }}>({controllableCount})</span>
              </button>

              <button
                className={`sh-chip ${activeFilter === 'sensors' ? 'active' : ''}`}
                onClick={() => setActiveFilter('sensors')}
              >
                <SvgSensor size={15} />
                <span>Sensores & Status</span>
                <span style={{ opacity: 0.7 }}>({sensorsCount})</span>
              </button>

              {rooms.map((room) => (
                <button
                  key={room}
                  className={`sh-chip ${activeFilter === room ? 'active' : ''}`}
                  onClick={() => setActiveFilter(room)}
                >
                  <SvgHome size={13} />
                  <span>{room}</span>
                </button>
              ))}
            </div>
          )}

          {/* MAIN DEVICES GRID AT THE TOP FOR FAST ACCESS */}
          {filteredDevices.length === 0 ? (
            <div className="sh-empty">
              <div className="sh-empty-icon">
                <SvgHome size={28} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f8fafc', margin: '0 0 6px' }}>
                Nenhum dispositivo nesta categoria
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94a3b8', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
                Selecione outro filtro acima para visualizar seus dispositivos.
              </p>
            </div>
          ) : (
            <div className="sh-grid">
              {filteredDevices.map((device) => {
                if (device.domain === 'sun' || device.domain === 'weather') {
                  return null
                }

                const domainLabel = DOMAIN_LABELS[device.domain] || device.type || device.domain
                const dynamicSvgIcon = getDynamicSvgIcon(device, 18)
                const formatted = formatEntityValue(device.state.value, device.state.unit, device.attributes.deviceClass as string || device.state.deviceClass)
                const roomOrDomainSub = device.room ? `${device.room} • ${domainLabel}` : domainLabel

                return (
                  <div
                    key={device.id}
                    className={`sh-card ${device.state.on ? 'on' : ''} ${device.domain}`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="sh-card-header">
                      <div className="sh-icon">{dynamicSvgIcon}</div>
                      <label className="sh-toggle" onClick={(e) => e.stopPropagation()}>
                        {CONTROLLABLE_DOMAINS.includes(device.domain) && (
                          <>
                            <input type="checkbox" checked={device.state.on} onChange={() => toggleDevice(device)} />
                            <span className="sh-slider" />
                          </>
                        )}
                      </label>
                    </div>
                    <div className="sh-body">
                      <h3 className="sh-name">{device.name}</h3>
                      <p className="sh-sub">{roomOrDomainSub}</p>
                      {device.domain === 'light' && device.state.on && device.state.brightness != null && (
                        <>
                          <div style={{ display: 'flex', justify: 'space-between', fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginTop: '10px' }}>
                            <span>Brilho</span><span>{device.state.brightness}%</span>
                          </div>
                          <div className="sh-bar" onClick={(e) => { e.stopPropagation(); setBrightness(device, device.state.brightness! > 50 ? 25 : 75) }}>
                            <div className="sh-fill" style={{ width: `${device.state.brightness}%` }} />
                          </div>
                        </>
                      )}
                      {device.domain === 'climate' && (
                        <div className="sh-temp">
                          <button className="sh-temp-btn" onClick={(e) => { e.stopPropagation(); adjustTemp(device, -1) }}>-</button>
                          <span style={{ fontSize: '17px', fontWeight: 700, color: '#38bdf8' }}>
                            {device.state.targetTemperature || device.state.temperature || '--'}°C
                          </span>
                          <button className="sh-temp-btn" onClick={(e) => { e.stopPropagation(); adjustTemp(device, 1) }}>+</button>
                          {device.state.temperature != null && <span style={{ fontSize: '12px', color: '#94a3b8' }}>atual: {device.state.temperature}°</span>}
                        </div>
                      )}
                      {device.domain === 'sensor' && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '15px', color: '#38bdf8', fontWeight: 700, margin: 0 }}>
                            {formatted.primary}
                          </p>
                          {formatted.secondary && (
                            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <SvgClock size={11} /> {formatted.secondary}
                            </p>
                          )}
                        </div>
                      )}
                      {device.domain === 'cover' && (
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                          {device.state.isOpen ? 'Aberto' : 'Fechado'}{device.state.position != null ? ` (${device.state.position}%)` : ''}
                        </p>
                      )}
                      {device.domain === 'lock' && (
                        <p style={{ fontSize: '13px', color: device.state.locked ? '#34d399' : '#f87171', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {device.state.locked ? <><SvgLock size={13} color="#34d399" /> Trancado</> : <><SvgUnlock size={13} color="#f87171" /> Destrancado</>}
                        </p>
                      )}
                      {device.domain === 'media_player' && device.state.mediaTitle && (
                        <p style={{ fontSize: '12px', color: '#38bdf8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SvgPlay size={11} color="#38bdf8" /> {device.state.mediaTitle}
                        </p>
                      )}
                      {device.domain === 'binary_sensor' && (
                        <p style={{ fontSize: '13px', color: device.state.on ? '#f87171' : '#94a3b8', fontWeight: 600, marginTop: '8px' }}>
                          {device.state.on ? 'Ativo' : 'Inativo'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* SECONDARY WIDGETS SECTION BELOW DEVICES */}
          <div className="sh-widgets-grid">
            <LiveClockWidget activeDevicesCount={activeDevicesTotal} totalDevicesCount={devices.length} />
            {sunDevice && <SunWidget device={sunDevice} />}
            {weatherDevice && <WeatherWidget device={weatherDevice} />}
          </div>
        </>
      )}
    </div>
  )
}
