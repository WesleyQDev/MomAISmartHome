import React, { useState, useEffect, useRef } from 'react'

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

const DOMAIN_ICONS: Record<string, string> = {
  light: '💡',
  switch: '🔌',
  fan: '🌀',
  cover: '🪟',
  lock: '🔒',
  climate: '🌡️',
  sensor: '📊',
  binary_sensor: '📡',
  media_player: '📺',
  camera: '📹',
  vacuum: '🧹',
  scene: '🎨',
  automation: '⚙️',
  alarm_control_panel: '🔐',
  sun: '☀️',
  weather: '🌤️',
  remote: '🎮'
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

// --- SVG Icons ---
const SvgPower = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v10" />
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  </svg>
)

const SvgSun = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

const SvgColorWheel = ({ size = 22 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', border: '2px solid rgba(255,255,255,0.8)', boxSizing: 'border-box' }} />
)

const SvgTemp = ({ size = 22 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #ff9e3b, #60a5fa)', border: '2px solid rgba(255,255,255,0.8)', boxSizing: 'border-box' }} />
)

const SvgPlay = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const SvgPause = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

const SvgPrev = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const SvgNext = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const SvgMute = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)

const SvgMuteStrikethrough = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
    <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
  </svg>
)

const SvgVolDown = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="16" y1="12" x2="22" y2="12" />
  </svg>
)

const SvgVolUp = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)

const SvgHome = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const SvgBack = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const SvgTv = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="13" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
)

const SvgYoutube = () => (
  <svg width="72" height="32" viewBox="0 0 120 60" style={{ display: 'block', borderRadius: '4px' }}>
    <rect width="120" height="60" rx="8" fill="white"/>
    <g transform="matrix(.223746 0 0 .223746 4.958506 17.693975)">
      <path d="M154.3 17.5c-1.8-6.7-7.1-12-13.8-13.8C128.4.4 79.7.4 79.7.4S31 .5 18.9 3.8c-6.7 1.8-12 7.1-13.8 13.8C1.9 29.7 1.9 55 1.9 55s0 25.3 3.3 37.5c1.8 6.7 7.1 12 13.8 13.8 12.1 3.3 60.8 3.3 60.8 3.3s48.7 0 60.8-3.3c6.7-1.8 12-7.1 13.8-13.8 3.3-12.1 3.3-37.5 3.3-37.5s-.1-25.3-3.4-37.5z" fill="red"/>
      <path d="M104.6 55L64.2 31.6v46.8z" fill="#fff"/>
      <g fill="#282828">
        <path d="M227.9 99.7c-3.1-2.1-5.3-5.3-6.6-9.7s-1.9-10.2-1.9-17.5v-9.9c0-7.3.7-13.3 2.2-17.7 1.5-4.5 3.8-7.7 7-9.7s7.3-3.1 12.4-3.1c5 0 9.1 1 12.1 3.1s5.3 5.3 6.7 9.7 2.1 10.3 2.1 17.6v9.9c0 7.3-.7 13.1-2.1 17.5s-3.6 7.6-6.7 9.7c-3.1 2-7.3 3.1-12.5 3.1-5.4.1-9.6-1-12.7-3zM245.2 89c.9-2.2 1.3-5.9 1.3-10.9V56.8c0-4.9-.4-8.5-1.3-10.7-.9-2.3-2.4-3.4-4.5-3.4s-3.5 1.1-4.4 3.4-1.3 5.8-1.3 10.7v21.3c0 5 .4 8.7 1.2 10.9s2.3 3.3 4.5 3.3c2.1 0 3.6-1.1 4.5-3.3zm219.2-16.3v3.5l.4 9.9c.3 2.2.8 3.8 1.6 4.8s2.1 1.5 3.8 1.5c2.3 0 3.9-.9 4.7-2.7.9-1.8 1.3-4.8 1.4-8.9l13.3.8c.1.6.1 1.4.1 2.4 0 6.3-1.7 11-5.2 14.1s-8.3 4.7-14.6 4.7c-7.6 0-12.9-2.4-15.9-7.1s-4.6-12.1-4.6-22V61.6c0-10.2 1.6-17.7 4.7-22.4 3.2-4.7 8.6-7.1 16.2-7.1 5.3 0 9.3 1 12.1 2.9s4.8 4.9 6 9 1.7 9.7 1.7 16.9v11.7h-25.7zm2-28.8c-.8 1-1.3 2.5-1.6 4.7s-.4 5.5-.4 10v4.9h11.2v-4.9c0-4.4-.1-7.7-.4-10s-.8-3.9-1.6-4.8-2-1.4-3.6-1.4c-1.7.1-2.9.6-3.6 1.5zM190.5 71.4L173 8.2h15.3l6.1 28.6c1.6 7.1 2.7 13.1 3.5 18h.4c.5-3.6 1.7-9.5 3.5-17.9l6.3-28.7h15.3l-17.7 63.1v30.3h-15.1V71.4z"/>
        <path d="M311.5 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z"/>
        <path d="M390.4 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z"/>
        <path d="M353.3 20.6H338v81.1h-15V20.6h-15.3V8.2h45.5v12.4zm87.9 23.7c-.9-4.3-2.4-7.4-4.5-9.4-2.1-1.9-4.9-2.9-8.6-2.9-2.8 0-5.5.8-7.9 2.4-2.5 1.6-4.3 3.7-5.7 6.3h-.1v-36h-14.8v96.9h12.7l1.6-6.5h.3c1.2 2.3 3 4.1 5.3 5.5a16.26 16.26 0 0 0 7.9 2c5.2 0 9-2.4 11.5-7.2 2.4-4.8 3.7-12.3 3.7-22.4V62.2c0-7.6-.5-13.6-1.4-17.9zm-14.1 27.9c0 5-.2 8.9-.6 11.7s-1.1 4.8-2.1 6-2.3 1.8-3.9 1.8c-1.3 0-2.4-.3-3.5-.9s-1.9-1.5-2.6-2.7V49.3c.5-1.9 1.4-3.4 2.7-4.6s2.6-1.8 4.1-1.8c1.6 0 2.8.6 3.6 1.8.9 1.2 1.4 3.3 1.8 6.2.3 2.9.5 7 .5 12.4z"/>
      </g>
    </g>
  </svg>
)

interface BackendApi {
  connectToHomeAssistant(url: string, token: string, name?: string): Promise<any>
  getDevices(connectionId?: string): Promise<Device[]>
  turnOnDevice(deviceId: string, providerType?: string): Promise<any>
  turnOffDevice(deviceId: string, providerType?: string): Promise<any>
  callService(domain: string, service: string, data?: any, providerType?: string): Promise<any>
  listConnections(): Promise<Connection[]>
  disconnectAll(): Promise<any>
  removeConnection(connectionId: string): Promise<any>
  getStatus(): Promise<any>
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
  turnOnDevice: (deviceId, providerType?) => sendCommand('turnOnDevice', { deviceId, providerType }),
  turnOffDevice: (deviceId, providerType?) => sendCommand('turnOffDevice', { deviceId, providerType }),
  callService: (domain, service, data, providerType) => sendCommand('callService', { domain, service, data, providerType: providerType || 'homeassistant' }),
  listConnections: () => sendCommand('listConnections').then((r: any) => r.connections || []),
  disconnectAll: () => sendCommand('disconnectAll'),
  removeConnection: (connectionId) => sendCommand('removeConnection', { connectionId }),
  getStatus: () => sendCommand('getStatus')
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
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

function getDynamicIcon(device: Device): string {
  const dc = (device.attributes.deviceClass as string || device.state.deviceClass as string || '').toLowerCase()
  const domain = device.domain.toLowerCase()
  const name = device.name.toLowerCase()

  if (dc === 'temperature') return '🌡️'
  if (dc === 'humidity' || dc === 'moisture') return '💧'
  if (dc === 'battery') return '🔋'
  if (dc === 'power' || dc === 'energy' || dc === 'voltage' || dc === 'current') return '⚡'
  if (dc === 'pressure') return '📉'
  if (dc === 'illuminance') return '☀️'
  if (dc === 'motion' || dc === 'occupancy' || dc === 'presence') return '🚶'
  if (dc === 'door' || dc === 'window' || dc === 'opening' || dc === 'garage_door') return '🚪'
  if (dc === 'lock') return '🔒'
  if (dc === 'timestamp' || dc === 'date') return '🕒'
  if (dc === 'speed' || dc === 'wind_speed') return '💨'
  if (dc === 'gas' || dc === 'co' || dc === 'co2' || dc === 'smoke') return '🚨'
  if (dc === 'signal_strength') return '📶'

  if (name.includes('amanhecer') || name.includes('dawn') || name.includes('nascer')) return '🌅'
  if (name.includes('anoitecer') || name.includes('dusk') || name.includes('pôr') || name.includes('por do sol')) return '🌇'
  if (name.includes('meio-dia') || name.includes('noon')) return '☀️'
  if (name.includes('meia-noite') || name.includes('midnight')) return '🌌'
  if (name.includes('bateria') || name.includes('battery')) return '🔋'
  if (name.includes('temp')) return '🌡️'
  if (name.includes('umidade') || name.includes('humidity')) return '💧'
  if (name.includes('vento') || name.includes('wind')) return '💨'
  if (name.includes('pressao') || name.includes('pressão')) return '📉'
  if (name.includes('luz') || name.includes('lamp') || name.includes('light')) return '💡'
  if (name.includes('tv') || name.includes('televisao') || name.includes('television')) return '📺'

  return DOMAIN_ICONS[domain] || '⚙️'
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

function ColorWheelPicker({ selectedHex, onChange }: { selectedHex: string; onChange: (rgb: [number, number, number], hex: string) => void }) {
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
      onPointerDown={handlePointer}
      onPointerMove={(e) => { if (e.buttons === 1) handlePointer(e) }}
    >
      <div className="sh-color-wheel-handle" style={{ left: `${handlePos.x}px`, top: `${handlePos.y}px` }} />
    </div>
  )
}

function DeviceControlModal({ device, allDevices, onClose, onToggle }: { device: Device; allDevices: Device[]; onClose: () => void; onToggle: (d: Device) => void }) {
  const [brightness, setBrightnessState] = useState<number>(device.state.brightness ?? 94)
  const [tempPct, setTempPctState] = useState<number>(85)
  const [activeTab, setActiveTab] = useState<'brightness' | 'color' | 'temp'>('brightness')
  const [selectedRgbHex, setSelectedRgbHex] = useState<string>('#f97316')

  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [showInputSelector, setShowInputSelector] = useState<boolean>(false)

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

  const handleBrightnessChange = async (pct: number) => {
    setBrightnessState(pct)
    await api.callService('light', 'turn_on', {
      entity_id: device.id,
      brightness_pct: pct
    }, 'homeassistant')
  }

  const handleTempSliderChange = async (pct: number) => {
    setTempPctState(pct)
    const kelvinVal = Math.round(6500 - (pct / 100) * (6500 - 2000))
    await api.callService('light', 'turn_on', {
      entity_id: device.id,
      color_temp_kelvin: kelvinVal,
      brightness_pct: brightness
    }, 'homeassistant')
  }

  const applyColor = async (rgb: [number, number, number], hex: string) => {
    setSelectedRgbHex(hex)
    if (activeTab === 'temp') {
      const isWarm = hex === '#f97316' || hex === '#fed7aa' || hex === '#fef3c7'
      const kelvinVal = isWarm ? 2700 : 6500
      await api.callService('light', 'turn_on', {
        entity_id: device.id,
        color_temp_kelvin: kelvinVal,
        brightness_pct: brightness
      }, 'homeassistant')
    } else {
      await api.callService('light', 'turn_on', {
        entity_id: device.id,
        rgb_color: rgb,
        brightness_pct: brightness
      }, 'homeassistant')
    }
  }

  const sendRemoteCmd = async (command: string) => {
    let targetRemoteId = 'remote.tv_thucos'
    const related = (device.attributes.relatedEntities as Device[]) || []
    const remoteEntity = related.find((d) => d.domain === 'remote') || allDevices.find((d) => d.domain === 'remote')

    if (remoteEntity) {
      targetRemoteId = remoteEntity.id
    }

    await api.callService('remote', 'send_command', {
      entity_id: targetRemoteId,
      command
    }, 'homeassistant')
  }

  const handlePowerToggle = async () => {
    onToggle(device)

    let targetRemoteId = 'remote.tv_thucos'
    const related = (device.attributes.relatedEntities as Device[]) || []
    const remoteEntity = related.find((d) => d.domain === 'remote') || allDevices.find((d) => d.domain === 'remote')
    if (remoteEntity) targetRemoteId = remoteEntity.id

    try {
      await api.callService('remote', 'send_command', {
        entity_id: targetRemoteId,
        command: 'POWER'
      }, 'homeassistant')
    } catch {}

    try {
      const mediaId = device.domain === 'media_player' ? device.id : 'media_player.tv_thucos_2'
      await api.callService('media_player', 'toggle', {
        entity_id: mediaId
      }, 'homeassistant')
    } catch {}
  }

  const handleSourceClick = () => {
    setShowInputSelector(!showInputSelector)
  }

  const handleSelectSource = async (sourceName: string) => {
    setShowInputSelector(false)

    let targetMediaId = device.id
    let targetRemoteId = 'remote.tv_thucos'

    const related = (device.attributes.relatedEntities as Device[]) || []
    const mediaEntity = related.find((d) => d.domain === 'media_player') || (device.domain === 'media_player' ? device : null)
    const remoteEntity = related.find((d) => d.domain === 'remote') || allDevices.find((d) => d.domain === 'remote')

    if (mediaEntity) targetMediaId = mediaEntity.id
    if (remoteEntity) targetRemoteId = remoteEntity.id

    const sLower = sourceName.toLowerCase().trim()

    // 1. TV (TCL Live TV)
    if (sLower.includes('tv')) {
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'com.tcl.tv'
        }, 'homeassistant')
      } catch {}
      try {
        await api.callService('remote', 'send_command', {
          entity_id: targetRemoteId,
          command: 'TV'
        }, 'homeassistant')
      } catch {}
    } 
    // 2. HDMI 1 (Official TCL HW15 intent URI)
    else if (sLower.includes('hdmi 1') || sLower === 'hdmi1') {
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'content://android.media.tv/passthrough/com.tcl.tvinput%2F.TvPassThroughService%2FHW15'
        }, 'homeassistant')
      } catch {}
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'passthrough://html5/hdmi1'
        }, 'homeassistant')
      } catch {}
    } 
    // 3. HDMI 2 (Official TCL HW16 intent URI)
    else if (sLower.includes('hdmi 2') || sLower === 'hdmi2') {
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'content://android.media.tv/passthrough/com.tcl.tvinput%2F.TvPassThroughService%2FHW16'
        }, 'homeassistant')
      } catch {}
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'passthrough://html5/hdmi2'
        }, 'homeassistant')
      } catch {}
    } 
    // 4. AV (Official TCL HW5 intent URI)
    else if (sLower.includes('av')) {
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'content://android.media.tv/passthrough/com.tcl.tvinput%2F.TvPassThroughService%2FHW5'
        }, 'homeassistant')
      } catch {}
      try {
        await api.callService('remote', 'turn_on', {
          entity_id: targetRemoteId,
          activity: 'passthrough://html5/av'
        }, 'homeassistant')
      } catch {}
    }

    // 5. Universal HA Fallback
    try {
      await api.callService('media_player', 'select_source', {
        entity_id: targetMediaId,
        source: sourceName
      }, 'homeassistant')
    } catch {}
  }

  const launchYoutube = async () => {
    let targetRemoteId = 'remote.tv_thucos'
    const related = (device.attributes.relatedEntities as Device[]) || []
    const remoteEntity = related.find((d) => d.domain === 'remote') || allDevices.find((d) => d.domain === 'remote')
    if (remoteEntity) targetRemoteId = remoteEntity.id

    try {
      await api.callService('remote', 'turn_on', {
        entity_id: targetRemoteId,
        activity: 'com.google.android.youtube.tv'
      }, 'homeassistant')
    } catch {
      const mediaId = device.domain === 'media_player' ? device.id : 'media_player.tv_thucos_2'
      await api.callService('media_player', 'play_media', {
        entity_id: mediaId,
        media_content_type: 'app',
        media_content_id: 'com.google.android.youtube.tv'
      }, 'homeassistant')
    }
  }

  const handlePlayPauseClick = async () => {
    const nextState = !isPlaying
    setIsPlaying(nextState)
    await sendRemoteCmd('MEDIA_PLAY_PAUSE')
  }

  const handleMuteClick = async () => {
    const nextState = !isMuted
    setIsMuted(nextState)
    await sendRemoteCmd('VOLUME_MUTE')
  }

  const isLight = device.domain === 'light'
  const isMedia = device.domain === 'media_player' || device.domain === 'remote'

  const relatedMedia = ((device.attributes.relatedEntities as Device[]) || []).find((d) => d.domain === 'media_player') || (device.domain === 'media_player' ? device : null)
  const dynamicSourceList = (device.attributes.source_list as string[]) || (relatedMedia?.attributes.source_list as string[])
  const displaySources = dynamicSourceList && dynamicSourceList.length > 0 ? dynamicSourceList : ['TV', 'HDMI 1', 'HDMI 2', 'AV']

  let pillFillStyle = 'linear-gradient(to top, #ffffff, #f1f5f9)'
  let displayReadout = `${brightness}%`

  if (activeTab === 'temp') {
    pillFillStyle = 'linear-gradient(to top, #f97316 0%, #fed7aa 50%, #ffffff 100%)'
    displayReadout = `${tempPct}%`
  }

  return (
    <div className="sh-modal-overlay" onClick={onClose}>
      <div className="sh-modal-detail" onClick={(e) => e.stopPropagation()}>
        <button className="sh-modal-close-btn" onClick={onClose}>
          <SvgBack size={18} color="#9aa0a6" />
        </button>

        {isLight && (
          <div className="sh-modal-light-content">
            <div className="sh-light-readout">{displayReadout}</div>
            <div className="sh-light-subreadout">{device.name} • {device.state.on ? 'Ligado' : 'Desligado'}</div>

            {activeTab === 'color' ? (
              <ColorWheelPicker selectedHex={selectedRgbHex} onChange={applyColor} />
            ) : activeTab === 'temp' ? (
              <div
                className="sh-pill-slider-container"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickY = e.clientY - rect.top
                  const pct = Math.round(Math.max(0, Math.min(100, (1 - clickY / rect.height) * 100)))
                  handleTempSliderChange(pct)
                }}
              >
                <div className="sh-pill-slider-fill" style={{ height: `${tempPct}%`, background: pillFillStyle }}>
                  <div className="sh-pill-handle" />
                </div>
              </div>
            ) : (
              <div
                className="sh-pill-slider-container"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickY = e.clientY - rect.top
                  const pct = Math.round(Math.max(0, Math.min(100, (1 - clickY / rect.height) * 100)))
                  handleBrightnessChange(pct)
                }}
              >
                <div className="sh-pill-slider-fill" style={{ height: `${brightness}%`, background: pillFillStyle }}>
                  <div className="sh-pill-handle" />
                </div>
              </div>
            )}

            <div className="sh-light-ctrl-bar">
              <button className={`sh-light-ctrl-btn ${device.state.on ? 'active' : ''}`} title="Power" onClick={() => onToggle(device)}>
                <SvgPower size={19} />
              </button>
              <button className={`sh-light-ctrl-btn ${activeTab === 'brightness' ? 'active' : ''}`} title="Brilho (Branco)" onClick={() => setActiveTab('brightness')}>
                <SvgSun size={20} />
              </button>
              <button className={`sh-light-ctrl-btn ${activeTab === 'color' ? 'active' : ''}`} title="Color Picker (RGB)" onClick={() => setActiveTab('color')}>
                <SvgColorWheel size={22} />
              </button>
              <button className={`sh-light-ctrl-btn ${activeTab === 'temp' ? 'active' : ''}`} title="Temperatura de Cor" onClick={() => setActiveTab('temp')}>
                <SvgTemp size={22} />
              </button>
            </div>

            <div className="sh-color-grid" style={{ marginTop: '16px' }}>
              {COLOR_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  className="sh-color-circle"
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                  onClick={() => applyColor(preset.rgb as [number, number, number], preset.color)}
                />
              ))}
            </div>
          </div>
        )}

        {isMedia && (
          <div className="sh-modal-remote-content">
            <div className="sh-remote-header">
              <div className="sh-remote-pill-tag">Smart TV Remote</div>
              <h3 className="sh-remote-title">{device.name}</h3>
              <p className="sh-remote-state">{device.state.mediaTitle || (device.state.on ? 'CONECTADO' : 'DESLIGADO')}</p>
            </div>

            <div className="sh-dpad-ring">
              <button className="sh-dpad-btn up" title="Cima" onClick={() => sendRemoteCmd('DPAD_UP')}>▲</button>
              <button className="sh-dpad-btn down" title="Baixo" onClick={() => sendRemoteCmd('DPAD_DOWN')}>▼</button>
              <button className="sh-dpad-btn left" title="Esquerda" onClick={() => sendRemoteCmd('DPAD_LEFT')}>◀</button>
              <button className="sh-dpad-btn right" title="Direita" onClick={() => sendRemoteCmd('DPAD_RIGHT')}>▶</button>
              <button className="sh-dpad-center" title="OK / Select" onClick={() => sendRemoteCmd('DPAD_CENTER')}>OK</button>
            </div>

            <div className="sh-remote-actions-row">
              <button className="sh-remote-action-btn" title="Voltar" onClick={() => sendRemoteCmd('BACK')}>
                <SvgBack size={20} />
              </button>
              <button className="sh-remote-action-btn" title="Home" onClick={() => sendRemoteCmd('HOME')}>
                <SvgHome size={20} />
              </button>
              <button className="sh-remote-action-btn youtube-pill" title="Abrir YouTube" onClick={launchYoutube}>
                <SvgYoutube />
              </button>
              <button className={`sh-remote-action-btn ${showInputSelector ? 'active' : ''}`} title="Source / Entradas" onClick={handleSourceClick}>
                <SvgTv size={20} />
              </button>
              <button
                className="sh-remote-action-btn power"
                title="Ligar / Desligar"
                onClick={handlePowerToggle}
                style={{ background: '#ea4335', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(234, 67, 53, 0.45)' }}
              >
                <SvgPower size={20} color="#ffffff" />
              </button>
            </div>

            {showInputSelector && (
              <div className="sh-input-selector-popover">
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0ea5e9', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📺 Selecionar Entrada da TV
                </div>
                <div className="sh-input-grid">
                  {displaySources.map((src, i) => {
                    let icon = '🔌'
                    const sLower = src.toLowerCase()
                    if (sLower.includes('tv')) icon = '📺'
                    if (sLower.includes('av')) icon = '📼'

                    return (
                      <button key={i} className="sh-input-chip" onClick={() => handleSelectSource(src)}>
                        <span>{icon}</span>
                        <span>{src}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="sh-remote-media-row">
              <button className="sh-remote-icon-btn" title="Anterior" onClick={() => sendRemoteCmd('MEDIA_PREVIOUS')}>
                <SvgPrev size={18} />
              </button>
              <button className="sh-remote-icon-btn main" title={isPlaying ? 'Pausar (Pause)' : 'Reproduzir (Play)'} onClick={handlePlayPauseClick}>
                {isPlaying ? <SvgPause size={20} /> : <SvgPlay size={20} />}
              </button>
              <button className="sh-remote-icon-btn" title="Próximo" onClick={() => sendRemoteCmd('MEDIA_NEXT')}>
                <SvgNext size={18} />
              </button>
            </div>

            <div className="sh-remote-vol-row">
              <button
                className={`sh-remote-icon-btn ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Desativar Mudo' : 'Mudo'}
                onClick={handleMuteClick}
                style={isMuted ? { background: 'rgba(239,68,68,0.18)', border: '1px solid #ef4444', color: '#ef4444' } : {}}
              >
                {isMuted ? <SvgMuteStrikethrough size={20} /> : <SvgMute size={18} />}
              </button>
              <button className="sh-remote-icon-btn" title="Volume -" onClick={() => sendRemoteCmd('VOLUME_DOWN')}>
                <SvgVolDown size={18} />
              </button>
              <button className="sh-remote-icon-btn" title="Volume +" onClick={() => sendRemoteCmd('VOLUME_UP')}>
                <SvgVolUp size={18} />
              </button>
            </div>
          </div>
        )}

        {!isLight && !isMedia && (
          <div className="sh-modal-default-content">
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{getDynamicIcon(device)}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{device.name}</h3>
              <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 24px' }}>{DOMAIN_LABELS[device.domain] || device.type} • {device.provider}</p>

              {CONTROLLABLE_DOMAINS.includes(device.domain) && (
                <button
                  className="sh-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '15px' }}
                  onClick={() => onToggle(device)}
                >
                  <SvgPower size={18} />
                  <span>{device.state.on ? 'Desligar Dispositivo' : 'Ligar Dispositivo'}</span>
                </button>
              )}
            </div>
          </div>
        )}
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
    <div className={`sh-sun-widget ${isAbove ? 'day' : 'night'}`}>
      <div className="sh-sun-header">
        <div className="sh-sun-badge">
          <span className="sh-sun-icon">{isAbove ? '☀️' : '🌙'}</span>
          <span>{isAbove ? 'Acima do Horizonte (Dia)' : 'Abaixo do Horizonte (Noite)'}</span>
        </div>
        <span className="sh-sun-elevation">Elevação: {elevation}°</span>
      </div>

      <div className="sh-sun-arc-container">
        <svg className="sh-sun-arc-svg" viewBox="0 0 200 90">
          <path d="M 10 80 A 90 90 0 0 1 190 80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeDasharray="4 4" />
          <path
            d="M 10 80 A 90 90 0 0 1 190 80"
            fill="none"
            stroke={isAbove ? '#ffe082' : '#818cf8'}
            strokeWidth="4"
            strokeDasharray="280"
            strokeDashoffset={isAbove ? Math.max(0, 140 - (elevation * 2)) : 220}
          />
          <circle
            cx={isAbove ? Math.min(170, Math.max(30, 100 + (elevation * 0.8))) : 100}
            cy={isAbove ? Math.max(20, 80 - (elevation * 0.7)) : 75}
            r="10"
            fill={isAbove ? '#f59e0b' : '#6366f1'}
            filter="drop-shadow(0 0 8px #f59e0b)"
          />
          <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </svg>
      </div>

      <div className="sh-sun-times">
        <div className="sh-sun-time-box">
          <span className="sh-sun-time-label">🌅 Nascer do Sol</span>
          <span className="sh-sun-time-val">{nextRising}</span>
        </div>
        <div className="sh-sun-time-box">
          <span className="sh-sun-time-label">🌇 Pôr do Sol</span>
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

  const weatherIcons: Record<string, string> = {
    'clear-night': '🌙',
    'sunny': '☀️',
    'partlycloudy': '⛅',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'pouring': '🌧️',
    'lightening': '🌩️',
    'snowy': '❄️',
    'fog': '🌫️'
  }

  const icon = weatherIcons[state] || '🌤️'

  return (
    <div className="sh-weather-widget">
      <div className="sh-weather-main">
        <div className="sh-weather-icon">{icon}</div>
        <div>
          <h3 className="sh-weather-name">{device.name}</h3>
          <p className="sh-weather-state">{state.replace('-', ' ').toUpperCase()}</p>
        </div>
        {temp != null && <div className="sh-weather-temp">{temp}°C</div>}
      </div>

      <div className="sh-weather-details">
        {humidity != null && (
          <div className="sh-weather-detail">
            <span>💧 Umidade</span>
            <strong>{humidity}%</strong>
          </div>
        )}
        {pressure != null && (
          <div className="sh-weather-detail">
            <span>📉 Pressão</span>
            <strong>{pressure} hPa</strong>
          </div>
        )}
        {wind != null && (
          <div className="sh-weather-detail">
            <span>💨 Vento</span>
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
  const [tabFilter, setTabFilter] = useState<'controllable' | 'sensors' | 'all'>('controllable')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null)
  const [activeRoomFilter, setActiveRoomFilter] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [haUrl, setHaUrl] = useState('')
  const [haToken, setHaToken] = useState('')
  const [connectError, setConnectError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const status = await api.getStatus()
      setIsConnected(status.connected)
      const conns = await api.listConnections()
      setConnections(conns)

      if (status.connected) {
        const devs = await api.getDevices()
        const deduplicated = deduplicateDevicesByName(devs)
        setDevices(deduplicated)
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao carregar status:', err)
    }
    setLoading(false)
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
        setHaUrl('')
        setHaToken('')
        await loadStatus()
      } else {
        setConnectError(result.message || result.error || 'Falha ao conectar')
      }
    } catch (err: any) {
      setConnectError(err.message || 'Erro ao conectar')
    }
    setConnecting(false)
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await api.removeConnection(connectionId)
      await loadStatus()
    } catch (err) {
      console.warn('[SmartHome] Erro ao desconectar:', err)
    }
  }

  const handleDisconnectAll = async () => {
    try {
      await api.disconnectAll()
      setDevices([])
      await loadStatus()
    } catch (err) {
      console.warn('[SmartHome] Erro ao desconectar tudo:', err)
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
    await api.turnOnDevice(device.id, device.provider?.toLowerCase().replace(/\s+/g, '') || 'homeassistant')
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, state: { ...d.state, brightness } } : d)))
  }

  const adjustTemp = async (device: Device, delta: number) => {
    const newTemp = Math.min(30, Math.max(16, (device.state.targetTemperature || 22) + delta))
    await api.turnOnDevice(device.id, device.provider?.toLowerCase().replace(/\s+/g, '') || 'homeassistant')
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, state: { ...d.state, targetTemperature: newTemp } } : d))
    )
  }

  const rooms = [...new Set(devices.map((d) => d.room).filter(Boolean))]

  const filteredDevices = devices.filter((d) => {
    if (tabFilter === 'controllable' && !CONTROLLABLE_DOMAINS.includes(d.domain)) return false
    if (tabFilter === 'sensors' && CONTROLLABLE_DOMAINS.includes(d.domain)) return false
    if (activeCategoryFilter && d.domain !== activeCategoryFilter) return false
    if (activeRoomFilter && d.room !== activeRoomFilter) return false
    return true
  })

  const activeCount = (domain: string) => devices.filter((d) => d.domain === domain && d.state.on).length
  const totalCount = (domain: string) => devices.filter((d) => d.domain === domain).length

  return (
    <div className="sh-root">
      <style>{`
        html, body {
          margin: 0; padding: 0; height: 100%; overflow: hidden;
        }
        .sh-root {
          background-color: #141519; color: #e2e2e6;
          height: 100vh; overflow-y: auto; overflow-x: hidden;
          padding: 36px 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }
        .sh-root::-webkit-scrollbar {
          width: 8px;
        }
        .sh-root::-webkit-scrollbar-track {
          background: #141519;
        }
        .sh-root::-webkit-scrollbar-thumb {
          background: #2b2d37;
          border-radius: 4px;
        }
        
        /* Tactile Depth & Press Animation for Buttons */
        .sh-btn, .sh-btn-primary, .sh-tab-btn, .sh-chip, .sh-card,
        .sh-light-ctrl-btn, .sh-color-circle, .sh-dpad-center,
        .sh-remote-action-btn, .sh-remote-icon-btn, .sh-modal-close-btn, .sh-input-chip {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease, background 0.2s ease, border-color 0.2s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .sh-btn:active, .sh-btn-primary:active, .sh-tab-btn:active, .sh-chip:active,
        .sh-light-ctrl-btn:active, .sh-color-circle:active, .sh-dpad-center:active,
        .sh-remote-action-btn:active, .sh-remote-icon-btn:active, .sh-modal-close-btn:active, .sh-input-chip:active {
          transform: scale(0.92) translateY(2px) !important;
          box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0,0,0,0.3) !important;
        }

        .sh-dpad-btn {
          transition: transform 0.15s ease, color 0.15s ease, filter 0.15s ease;
          user-select: none;
        }
        .sh-dpad-btn:active {
          transform: scale(0.85) !important;
          filter: brightness(1.5);
        }

        .sh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .sh-title { font-size: 28px; font-weight: 700; color: #f1f0f4; display: flex; align-items: center; gap: 12px; margin: 0; }
        .sh-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .sh-btn { background: #1f2128; border: none; color: #a8c7fa; padding: 10px 18px; border-radius: 9999px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .sh-btn:hover { background: #2b2d37; color: #fff; transform: translateY(-1px); }
        .sh-btn-primary { background: #a8c7fa; color: #042e6f; border: none; padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; box-shadow: 0 6px 16px rgba(168,199,250,0.25); }
        .sh-btn-primary:hover { background: #c2e7ff; transform: translateY(-1px); }
        .sh-btn-danger { background: #3a2020; color: #f28b82; }
        .sh-btn-danger:hover { background: #4d2a2a; }
        .sh-badge { display: flex; align-items: center; gap: 10px; background: #1f2128; padding: 10px 20px; border-radius: 9999px; font-size: 13px; color: #c4c6d0; font-weight: 500; }
        .sh-dot { width: 8px; height: 8px; border-radius: 50%; background: #34a853; box-shadow: 0 0 12px rgba(52,168,83,0.7); }
        .sh-dot.off { background: #ea4335; box-shadow: 0 0 12px rgba(234,67,53,0.7); }
        .sh-auth { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 160px); }
        .sh-auth-card { background: #1f2128; border-radius: 32px; padding: 44px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .sh-auth-icon { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(14,165,233,0.3); }
        .sh-auth-title { font-size: 24px; font-weight: 700; color: #f1f0f4; margin: 0 0 10px; }
        .sh-auth-sub { font-size: 14px; color: #9aa0a6; line-height: 1.6; margin: 0 0 28px; }
        .sh-auth-feats { display: flex; flex-direction: column; gap: 14px; text-align: left; margin-bottom: 32px; background: #18191e; padding: 20px; border-radius: 20px; }
        .sh-auth-feat { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #c4c6d0; }
        .sh-modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .sh-modal { background: #1f2128; border-radius: 28px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
        .sh-input { width: 100%; background: #141519; border: 1px solid #2d313b; border-radius: 12px; padding: 12px 16px; color: white; font-size: 14px; margin-top: 6px; box-sizing: border-box; outline: none; }
        .sh-input:focus { border-color: #0ea5e9; }
        .sh-label { display: block; font-size: 13px; font-weight: 600; color: #c4c6d0; margin-top: 14px; }
        
        .sh-main-tabs { display: flex; gap: 8px; background: #1f2128; padding: 6px; border-radius: 9999px; margin-bottom: 24px; width: fit-content; }
        .sh-tab-btn { background: transparent; border: none; color: #9aa0a6; padding: 8px 20px; border-radius: 9999px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .sh-tab-btn.active { background: #0ea5e9; color: #fff; box-shadow: 0 4px 14px rgba(14,165,233,0.35); }
        
        .sh-chips { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 24px; scrollbar-width: none; }
        .sh-chip { display: flex; align-items: center; gap: 8px; background: #1f2128; border: none; padding: 10px 18px; border-radius: 9999px; font-size: 13px; font-weight: 500; color: #c4c6d0; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .sh-chip:hover { background: #2b2d37; color: #fff; transform: translateY(-1px); }
        .sh-chip.active { background: #1a2e3a; color: #7dd3fc; box-shadow: 0 4px 12px rgba(14,165,233,0.25); }
        .sh-section { font-size: 19px; font-weight: 600; color: #f1f0f4; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 44px; }
        .sh-card { background: #1f2128; border: none; border-radius: 28px; padding: 22px; position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 155px; cursor: pointer; box-sizing: border-box; box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
        .sh-card:hover { transform: translateY(-3px); background: #262932; box-shadow: 0 16px 36px rgba(0,0,0,0.4); }
        .sh-card.on.light { background: #332d1e; }
        .sh-card.on.climate { background: #1e2a3a; }
        .sh-card.on.lock { background: #1d2e24; }
        .sh-card-header { display: flex; justify-content: space-between; align-items: center; }
        .sh-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.25s; }
        .sh-card.on.light .sh-icon { background: #ffe082; }
        .sh-card.on.climate .sh-icon { background: #a8c7fa; }
        .sh-card.on.lock .sh-icon { background: #a8dab5; }
        .sh-toggle { position: relative; display: inline-block; width: 48px; height: 28px; }
        .sh-toggle input { opacity: 0; width: 0; height: 0; }
        .sh-slider { position: absolute; cursor: pointer; top:0; left:0; right:0; bottom:0; background: rgba(255,255,255,0.12); transition: .3s; border-radius: 34px; }
        .sh-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background: #e2e2e6; transition: .3s; border-radius: 50%; }
        input:checked + .sh-slider { background: #a8c7fa; }
        .sh-card.on.light input:checked + .sh-slider { background: #ffe082; }
        input:checked + .sh-slider:before { transform: translateX(20px); background: #141519; }
        .sh-body { margin-top: 14px; }
        .sh-name { font-size: 15px; font-weight: 600; color: #fff; margin: 0 0 2px; }
        .sh-sub { font-size: 12px; color: #9aa0a6; margin: 0; }
        .sh-bar { margin-top: 12px; height: 8px; border-radius: 9999px; background: rgba(255,255,255,0.1); overflow: hidden; cursor: pointer; }
        .sh-fill { height: 100%; background: #ffe082; border-radius: 9999px; transition: width 0.15s; }
        .sh-temp { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
        .sh-temp-btn { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .sh-temp-btn:hover { background: rgba(255,255,255,0.25); }
        .sh-empty { background: #1f2128; border-radius: 28px; padding: 48px 32px; text-align: center; margin-bottom: 44px; }

        .sh-sun-widget {
          background: linear-gradient(135deg, #1e1b4b, #311b92);
          border-radius: 28px; padding: 24px;
          grid-column: span 1; box-shadow: 0 12px 28px rgba(0,0,0,0.3);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .sh-sun-widget.day { background: linear-gradient(135deg, #451a03, #78350f); }
        .sh-sun-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .sh-sun-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #fff; }
        .sh-sun-elevation { font-size: 11px; color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.12); padding: 4px 10px; border-radius: 9999px; font-weight: 600; }
        .sh-sun-arc-container { display: flex; justify-content: center; margin: 4px 0; }
        .sh-sun-arc-svg { width: 100%; max-width: 220px; height: 80px; }
        .sh-sun-times { display: flex; justify-around: space-around; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 16px; margin-top: 10px; }
        .sh-sun-time-box { display: flex; flex-direction: column; align-items: center; }
        .sh-sun-time-label { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 2px; }
        .sh-sun-time-val { font-size: 14px; font-weight: 700; color: #fff; }

        .sh-weather-widget {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 28px; padding: 24px;
          grid-column: span 1; box-shadow: 0 12px 28px rgba(0,0,0,0.3);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .sh-weather-main { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .sh-weather-icon { font-size: 36px; }
        .sh-weather-name { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 2px; }
        .sh-weather-state { font-size: 11px; color: #7dd3fc; margin: 0; font-weight: 600; letter-spacing: 0.5px; }
        .sh-weather-temp { margin-left: auto; font-size: 28px; font-weight: 800; color: #38bdf8; }
        .sh-weather-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.06); padding: 10px; border-radius: 16px; }
        .sh-weather-detail { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: #94a3b8; }
        .sh-weather-detail strong { color: #f8fafc; font-size: 13px; margin-top: 2px; }

        .sh-modal-detail {
          background: #18191f;
          border-radius: 36px;
          padding: 32px 28px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7);
          position: relative;
          box-sizing: border-box;
        }
        .sh-modal-close-btn {
          position: absolute;
          top: 20px; left: 20px;
          background: rgba(255,255,255,0.08);
          border: none; color: #9aa0a6;
          width: 36px; height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .sh-modal-close-btn:hover {
          background: rgba(255,255,255,0.2); color: #fff;
        }
        .sh-light-readout {
          font-size: 44px; font-weight: 800; color: #ffffff; text-align: center; margin-top: 14px; line-height: 1;
        }
        .sh-light-subreadout {
          font-size: 13px; color: #9aa0a6; text-align: center; margin-bottom: 24px; font-weight: 500; margin-top: 6px;
        }
        .sh-pill-slider-container {
          width: 130px; height: 250px; border-radius: 65px; background: #252833; margin: 0 auto 24px; position: relative; overflow: hidden; cursor: pointer; box-shadow: inset 0 2px 10px rgba(0,0,0,0.6);
        }
        .sh-pill-slider-fill {
          position: absolute; bottom: 0; left: 0; right: 0; border-radius: 0 0 65px 65px; transition: height 0.15s ease-out, background 0.2s; display: flex; justify-content: center; align-items: flex-start;
        }
        .sh-pill-handle {
          width: 36px; height: 5px; background: rgba(0,0,0,0.25); border-radius: 9999px; margin-top: 12px;
        }
        .sh-light-ctrl-bar {
          display: flex; justify-content: center; align-items: center; gap: 12px; background: #121317; padding: 6px 14px; border-radius: 9999px; margin: 0 auto 24px; width: fit-content; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }
        .sh-light-ctrl-btn {
          width: 44px; height: 44px; border-radius: 50%; border: none; background: transparent; color: #9aa0a6; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .sh-light-ctrl-btn.active {
          background: #ffffff; color: #141519; box-shadow: 0 4px 16px rgba(255,255,255,0.35);
        }
        
        /* 240px Interactive Conic Color Wheel Picker */
        .sh-color-wheel {
          width: 240px; height: 240px; border-radius: 50%; margin: 10px auto 24px; position: relative;
          background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
          mask-image: radial-gradient(circle, #fff 100%, transparent 100%);
          cursor: crosshair; box-shadow: 0 12px 32px rgba(0,0,0,0.5);
          touch-action: none;
        }
        .sh-color-wheel::after {
          content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%);
        }
        .sh-color-wheel-handle {
          position: absolute; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.6); transform: translate(-50%, -50%); pointer-events: none; z-index: 10; background: rgba(255,255,255,0.3);
        }

        .sh-color-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; max-width: 260px; margin: 0 auto; justify-items: center;
        }
        .sh-color-circle {
          width: 48px; height: 48px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        }
        .sh-color-circle:hover {
          transform: scale(1.08); border-color: rgba(255,255,255,0.8);
        }

        /* Smart TV Remote Layout */
        .sh-modal-remote-content {
          text-align: center; padding: 10px 0;
        }
        .sh-remote-header {
          margin-bottom: 20px;
        }
        .sh-remote-pill-tag {
          display: inline-block; font-size: 11px; font-weight: 700; color: #0ea5e9; background: rgba(14,165,233,0.12); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .sh-remote-title {
          font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 4px;
        }
        .sh-remote-state {
          font-size: 12px; color: #9aa0a6; margin: 0; font-weight: 500;
        }

        /* D-Pad Touch Ring */
        .sh-dpad-ring {
          width: 190px; height: 190px; border-radius: 50%; background: #232530; margin: 0 auto 24px; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 3px 10px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06);
        }
        .sh-dpad-btn {
          position: absolute; background: none; border: none; color: #c4c6d0; font-size: 15px; cursor: pointer; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
        }
        .sh-dpad-btn:hover { color: #fff; transform: scale(1.15); }
        .sh-dpad-btn.up { top: 6px; }
        .sh-dpad-btn.down { bottom: 6px; }
        .sh-dpad-btn.left { left: 6px; }
        .sh-dpad-btn.right { right: 6px; }
        .sh-dpad-center {
          width: 74px; height: 74px; border-radius: 50%; background: #141519; border: 2px solid rgba(255,255,255,0.1); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.5);
        }
        .sh-dpad-center:hover { background: #0ea5e9; border-color: #0ea5e9; }

        .sh-remote-actions-row {
          display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: nowrap;
        }
        .sh-remote-action-btn {
          width: 44px; height: 44px; border-radius: 50%; background: #232530; border: 1px solid rgba(255,255,255,0.06); color: #c4c6d0; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(0,0,0,0.35); flex-shrink: 0;
        }
        .sh-remote-action-btn:hover, .sh-remote-action-btn.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
        .sh-remote-action-btn.youtube-pill {
          width: auto; height: 44px; padding: 0 10px; border-radius: 12px; background: #ffffff; border: none; box-shadow: 0 4px 14px rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .sh-remote-action-btn.youtube-pill:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 6px 18px rgba(255,255,255,0.4); }
        .sh-remote-action-btn.power {
          background: #ea4335 !important; color: #ffffff !important; border: none !important; box-shadow: 0 6px 18px rgba(234,67,53,0.45) !important;
        }

        .sh-input-selector-popover {
          background: #141519; border: 1px solid rgba(14,165,233,0.3); border-radius: 20px; padding: 14px; margin: 0 auto 20px; max-width: 320px; box-shadow: 0 10px 24px rgba(0,0,0,0.5); animation: fadeIn 0.2s ease-out;
        }
        .sh-input-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
        }
        .sh-input-chip {
          background: #232530; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 10px; color: #e2e2e6; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; justify-content: center;
        }
        .sh-input-chip:hover {
          background: #0ea5e9; color: #fff; border-color: #0ea5e9;
        }

        .sh-remote-media-row, .sh-remote-vol-row {
          display: flex; justify-content: center; gap: 12px; margin-bottom: 12px;
        }
        .sh-remote-icon-btn {
          width: 44px; height: 44px; border-radius: 50%; background: #18191f; border: 1px solid rgba(255,255,255,0.05); color: #c4c6d0; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .sh-remote-icon-btn:hover { background: #252833; color: #fff; }
        .sh-remote-icon-btn.main { background: #0ea5e9; color: #fff; border: none; box-shadow: 0 6px 18px rgba(14,165,233,0.45); }
      `}</style>

      <div className="sh-header">
        <h1 className="sh-title">
          <span>🏡</span>
          <span>MomAI Smart Home</span>
        </h1>
        <div className="sh-actions">
          {connections.length > 0 && (
            <>
              {connections.map((c) => (
                <div key={c.id} className="sh-badge">
                  <span className="sh-dot" />
                  <span>{c.name}</span>
                  <button
                    onClick={() => handleDisconnect(c.id)}
                    style={{ background: 'none', border: 'none', color: '#f28b82', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginLeft: '4px' }}
                  >
                    Sair
                  </button>
                </div>
              ))}
              <button className="sh-btn sh-btn-danger" onClick={handleDisconnectAll}>
                Desconectar Todos
              </button>
            </>
          )}
          <button className="sh-btn-primary" onClick={() => setShowConnectModal(true)}>
            + Conectar Provedor
          </button>
        </div>
      </div>

      {showConnectModal && (
        <div className="sh-modal-overlay">
          <div className="sh-modal">
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'white' }}>
              Conectar ao Home Assistant
            </h3>
            <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 20px', lineHeight: 1.5 }}>
              Informe a URL do seu servidor Home Assistant e um Long-Lived Access Token.
            </p>
            <form onSubmit={handleConnect}>
              <label className="sh-label">URL do Home Assistant</label>
              <input className="sh-input" type="url" required placeholder="http://homeassistant.local:8123" value={haUrl} onChange={(e) => setHaUrl(e.target.value)} />
              <label className="sh-label">Long-Lived Access Token</label>
              <input className="sh-input" type="password" required placeholder="eyJhbGciOiJIUzI1NiIs..." value={haToken} onChange={(e) => setHaToken(e.target.value)} />
              {connectError && <p style={{ color: '#f28b82', fontSize: '13px', marginTop: '12px' }}>{connectError}</p>}
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
        <div className="sh-auth"><p style={{ color: '#9aa0a6' }}>Carregando...</p></div>
      ) : !isConnected ? (
        <div className="sh-auth">
          <div className="sh-auth-card">
            <div className="sh-auth-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
                <path d="M6.5 12a7.8 7.8 0 0 1 11 0" />
                <path d="M9 15a3.6 3.6 0 0 1 6 0" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <h2 className="sh-auth-title">MomAI Smart Home</h2>
            <p className="sh-auth-sub">
              Conecte seus dispositivos inteligentes via Home Assistant. Suporte a luzes, climatização, sensores, câmeras e muito mais.
            </p>
            <div className="sh-auth-feats">
              <div className="sh-auth-feat"><span>💡</span><span>Luzes, cores e brilho</span></div>
              <div className="sh-auth-feat"><span>🌡️</span><span>Climatização e termostatos</span></div>
              <div className="sh-auth-feat"><span>🔒</span><span>Fechaduras e sensores</span></div>
              <div className="sh-auth-feat"><span>📺</span><span>Mídia, câmeras e aspiradores</span></div>
            </div>
            <button className="sh-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px 24px', fontSize: '15px' }} onClick={() => setShowConnectModal(true)}>
              Conectar ao Home Assistant
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sh-main-tabs">
            <button
              className={`sh-tab-btn ${tabFilter === 'controllable' ? 'active' : ''}`}
              onClick={() => { setTabFilter('controllable'); setActiveCategoryFilter(null) }}
            >
              ⚡ Dispositivos Controláveis ({devices.filter((d) => CONTROLLABLE_DOMAINS.includes(d.domain)).length})
            </button>
            <button
              className={`sh-tab-btn ${tabFilter === 'sensors' ? 'active' : ''}`}
              onClick={() => { setTabFilter('sensors'); setActiveCategoryFilter(null) }}
            >
              📊 Sensores & Status ({devices.filter((d) => !CONTROLLABLE_DOMAINS.includes(d.domain)).length})
            </button>
            <button
              className={`sh-tab-btn ${tabFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setTabFilter('all'); setActiveCategoryFilter(null) }}
            >
              Todos ({devices.length})
            </button>
          </div>

          {devices.length > 0 && (
            <>
              <div className="sh-chips">
                <button className={`sh-chip ${!activeCategoryFilter ? 'active' : ''}`} onClick={() => { setActiveCategoryFilter(null); setActiveRoomFilter(null) }}>
                  Todas Categorias
                </button>
                {['light', 'climate', 'sensor', 'lock', 'cover', 'media_player', 'camera', 'switch', 'sun', 'weather', 'remote'].filter((d) => devices.some((dd) => dd.domain === d)).map((domain) => (
                  <button key={domain} className={`sh-chip ${activeCategoryFilter === domain ? 'active' : ''}`} onClick={() => setActiveCategoryFilter(activeCategoryFilter === domain ? null : domain)}>
                    {DOMAIN_ICONS[domain] || '⚙️'} {DOMAIN_LABELS[domain] || domain} ({activeCount(domain)}/{totalCount(domain)})
                  </button>
                ))}
              </div>
              {rooms.length > 0 && (
                <div className="sh-chips" style={{ marginBottom: '32px' }}>
                  <button className={`sh-chip ${!activeRoomFilter ? 'active' : ''}`} onClick={() => setActiveRoomFilter(null)}>
                    Todos os Cômodos
                  </button>
                  {rooms.map((room) => (
                    <button key={room} className={`sh-chip ${activeRoomFilter === room ? 'active' : ''}`} onClick={() => setActiveRoomFilter(activeRoomFilter === room ? null : room)}>
                      {room}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="sh-section">
            <span>{filteredDevices.length} item{filteredDevices.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="sh-empty">
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🏠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f0f4', margin: '0 0 8px' }}>
                Nenhum dispositivo encontrado nesta categoria
              </h3>
              <p style={{ fontSize: '14px', color: '#9aa0a6', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
                {connections.length > 0 ? 'Alterne as abas acima para visualizar sensores ou outros dispositivos.' : 'Conecte-se ao Home Assistant para gerenciar seus dispositivos inteligentes.'}
              </p>
            </div>
          ) : (
            <div className="sh-grid">
              {filteredDevices.map((device) => {
                if (device.domain === 'sun') {
                  return <SunWidget key={device.id} device={device} />
                }
                if (device.domain === 'weather') {
                  return <WeatherWidget key={device.id} device={device} />
                }

                const domainLabel = DOMAIN_LABELS[device.domain] || device.type || device.domain
                const dynamicIcon = getDynamicIcon(device)
                const formatted = formatEntityValue(device.state.value, device.state.unit, device.attributes.deviceClass as string || device.state.deviceClass)

                return (
                  <div
                    key={device.id}
                    className={`sh-card ${device.state.on ? 'on' : ''} ${device.domain}`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="sh-card-header">
                      <div className="sh-icon">{dynamicIcon}</div>
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
                      <p className="sh-sub">{device.room ? `${device.room} • ` : ''}{domainLabel} • {device.provider}</p>
                      {device.domain === 'light' && device.state.on && device.state.brightness != null && (
                        <>
                          <div style={{ display: 'flex', justify: 'space-between', fontSize: '11px', color: '#ffe082', fontWeight: 600, marginTop: '10px' }}>
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
                          <span style={{ fontSize: '18px', fontWeight: 700, color: '#a8c7fa' }}>
                            {device.state.targetTemperature || device.state.temperature || '--'}°C
                          </span>
                          <button className="sh-temp-btn" onClick={(e) => { e.stopPropagation(); adjustTemp(device, 1) }}>+</button>
                          {device.state.temperature != null && <span style={{ fontSize: '12px', color: '#9aa0a6' }}>atual: {device.state.temperature}°</span>}
                        </div>
                      )}
                      {device.domain === 'sensor' && (
                        <div style={{ marginTop: '8px' }}>
                          <p style={{ fontSize: '15px', color: '#a8c7fa', fontWeight: 700, margin: 0 }}>
                            {formatted.primary}
                          </p>
                          {formatted.secondary && (
                            <p style={{ fontSize: '11px', color: '#9aa0a6', margin: '2px 0 0' }}>
                              📅 {formatted.secondary}
                            </p>
                          )}
                        </div>
                      )}
                      {device.domain === 'cover' && (
                        <p style={{ fontSize: '12px', color: '#9aa0a6', marginTop: '8px' }}>
                          {device.state.isOpen ? 'Aberto' : 'Fechado'}{device.state.position != null ? ` (${device.state.position}%)` : ''}
                        </p>
                      )}
                      {device.domain === 'lock' && (
                        <p style={{ fontSize: '13px', color: device.state.locked ? '#a8dab5' : '#f28b82', fontWeight: 600, marginTop: '8px' }}>
                          {device.state.locked ? '🔒 Trancado' : '🔓 Destrancado'}
                        </p>
                      )}
                      {device.domain === 'media_player' && device.state.mediaTitle && (
                        <p style={{ fontSize: '12px', color: '#d7aefb', marginTop: '8px' }}>
                          ▶ {device.state.mediaTitle}
                        </p>
                      )}
                      {device.domain === 'binary_sensor' && (
                        <p style={{ fontSize: '13px', color: device.state.on ? '#f28b82' : '#9aa0a6', fontWeight: 600, marginTop: '8px' }}>
                          {device.state.on ? 'Ativo' : 'Inativo'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
