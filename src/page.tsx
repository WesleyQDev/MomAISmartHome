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
  SvgEye,
  SvgEyeOff,
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

const EXT_FETCH_TIMEOUT_MS = 10000

// fetch com timeout/AbortController: se o node-core/worker não responder, a
// promessa resolve com um objeto de erro em vez de pendurar para sempre —
// sem isso, um worker morto deixava a página em "Carregando" infinito.
function extFetch(path: string, body?: any): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), EXT_FETCH_TIMEOUT_MS)
  const url = `${getApiBase()}${path}`
  return fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal
  })
    .then((r) => {
      try {
        return r.json()
      } catch {
        return {}
      }
    })
    .catch((err) => {
      const aborted = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR' || err.code === 20)
      return {
        ok: false,
        error: aborted
          ? 'O servidor do MomAI não respondeu (timeout). Verifique se o app está rodando.'
          : (err?.message || 'Falha de rede ao falar com o servidor')
      }
    })
    .finally(() => clearTimeout(timer))
}

async function sendCommand(toolName: string, args: any = {}): Promise<any> {
  const res = await extFetch(`/extensions/${EXT_ID}/command`, { toolName, args })
  return res
}

const api: BackendApi = {
  connectToHomeAssistant: (url, token, name) => sendCommand('connectToHomeAssistant', { url, token, name }),
  getDevices: (connectionId?) => sendCommand('getDevices', { connectionId }).then((r: any) => (Array.isArray(r) ? r : r?.devices || [])),
  syncDevices: (connectionId?) => sendCommand('syncDevices', { connectionId }).then((r: any) => (Array.isArray(r) ? r : r?.devices || [])),
  turnOnDevice: (deviceId, providerType?, params?) => sendCommand('turnOnDevice', { deviceId, providerType, params }),
  turnOffDevice: (deviceId, providerType?, params?) => sendCommand('turnOffDevice', { deviceId, providerType, params }),
  setClimate: (deviceId, temperature, hvacMode, providerType?) => sendCommand('setClimate', { deviceId, temperature, hvacMode, providerType }),
  callService: (domain, service, data, providerType) => sendCommand('callService', { domain, service, data, providerType: providerType || 'homeassistant' }),
  listConnections: () => sendCommand('listConnections').then((r: any) => (Array.isArray(r) ? r : r?.connections || [])),
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
  const isMediaOrRemote = device.domain === 'media_player' || device.domain === 'remote'
  return (
    <div
      className="sh-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '340px', display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}
      >
        <DeviceControlCardContent
          device={device}
          allDevices={allDevices}
          onClose={onClose}
          onToggle={isMediaOrRemote ? undefined : onToggle}
          callServiceApi={async (domain, service, serviceData, providerType) => {
            const winApi = (window as any).api || (window as any).momaiAPI
            if (typeof winApi?.callService === 'function') {
              return winApi.callService(domain, service, serviceData, providerType || 'homeassistant')
            }
            const res = await api.callService(domain, service, serviceData, providerType)
            return res
          }}
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

const CACHE_DEVICES_KEY = 'momaismarthome:devices'
const CACHE_CONNS_KEY = 'momaismarthome:connections'
const CACHE_CONNECTED_KEY = 'momaismarthome:is_connected'
const CACHE_HAS_SAVED_KEY = 'momaismarthome:has_saved_conn'

const SH_TOOL_LABELS: Record<string, string> = {
  send_message: 'Enviar mensagem',
  control_device: 'Controlar dispositivo',
  set_light_color: 'Cor da luz',
  control_tv_remote: 'Controle da TV',
  control_climate: 'Controlar clima',
  call_ha_service: 'Serviço da casa',
  list_devices: 'Listar dispositivos',
  query_device: 'Consultar dispositivo',
  capture_snapshot: 'Capturar print',
  start_monitoring: 'Iniciar monitoramento',
  list_contacts: 'Listar contatos',
  get_history: 'Histórico'
}

const SH_PARAM_LABELS: Record<string, string> = {
  contact: 'Contato ou número',
  message: 'Mensagem',
  image: 'Imagem',
  device_name: 'Dispositivo',
  action: 'Ação',
  brightness: 'Brilho',
  color: 'Cor',
  temperature: 'Temperatura',
  domain: 'Domínio',
  service: 'Serviço',
  data: 'Dados',
  room: 'Cômodo',
  cameraId: 'Câmera',
  monitorId: 'Monitor',
  label: 'Rótulo'
}

const SH_PLACEHOLDERS = [
  { token: '{deviceName}', label: 'Dispositivo' },
  { token: '{deviceState}', label: 'Estado' },
  { token: '{deviceRoom}', label: 'Cômodo' },
  { token: '{entityId}', label: 'Entidade' },
  { token: '{event.imageDataUri}', label: 'Imagem' }
]

const SH_ENTITY_PARAMS = new Set(['contact', 'device_name', 'cameraId', 'monitorId'])

const SH_STATE_LABELS: Record<string, string> = {
  on: 'Ligado',
  off: 'Desligado'
}

interface ShWhen {
  device?: string
  room?: string
  state?: string
  domain?: string
}

interface ShAction {
  id?: string
  target: string
  tool: string
  args?: Record<string, unknown>
  when?: ShWhen
}
interface ShParam {
  type?: string
  description?: string
  default?: unknown
  enum?: string[]
}
interface ShTool {
  name: string
  description?: string
  parameters?: { properties?: Record<string, ShParam> } | null
}
interface ShExt {
  id: string
  name?: string
  installed?: boolean
  enabled?: boolean
  tools?: ShTool[]
}

function shHumanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function shFormatArgs(args?: Record<string, unknown>): string {
  if (!args) return ''
  return Object.entries(args)
    .filter(([, v]) => !(typeof v === 'string' && !v.trim()))
    .map(([k, v]) => {
      const val = v && typeof v === 'object' ? JSON.stringify(v) : String(v)
      return `${SH_PARAM_LABELS[k] || shHumanize(k)}: ${val}`
    })
    .join(' · ')
}

function shFormatWhen(when?: ShWhen): string {
  if (!when) return ''
  const parts: string[] = []
  if (when.device?.trim()) parts.push(`dispositivo ${when.device.trim()}`)
  if (when.room?.trim()) parts.push(`cômodo ${when.room.trim()}`)
  if (when.state?.trim()) parts.push(SH_STATE_LABELS[when.state.trim()] || when.state.trim())
  if (when.domain?.trim()) parts.push(`domínio ${when.domain.trim()}`)
  return parts.join(', ')
}

// Ao editar uma ação, remove valores que são apenas um placeholder solto de
// outro contexto (ex.: "{description}" ou "{event.imageDataUri}") salvos por
// versões antigas, para o usuário ver o campo vazio e preencher de verdade.
const SH_SOLO_PLACEHOLDER = /^\{[a-zA-Z0-9_.]+\}$/
function cleanSavedArgs(args?: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(args || {})) {
    if (typeof v === 'string' && SH_SOLO_PLACEHOLDER.test(v.trim())) continue
    out[k] = v
  }
  return out
}

function AutomationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [catalog, setCatalog] = useState<ShExt[]>([])
  const [actions, setActions] = useState<ShAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDraft, setShowDraft] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [target, setTarget] = useState('')
  const [tool, setTool] = useState('')
  const [draftArgs, setDraftArgs] = useState<Record<string, unknown>>({})
  const [draftWhen, setDraftWhen] = useState<ShWhen>({})

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setShowDraft(false)
    setEditingId(null)
    setDraftWhen({})
    setSaveState('idle')
    Promise.all([
      extFetch('/extensions'),
      sendCommand('get_actions')
    ])
      .then(([cat, act]) => {
        const installed = (cat || []).filter(
          (e: ShExt) =>
            e.installed !== false &&
            e.enabled !== false &&
            Array.isArray(e.tools) &&
            e.tools.length > 0
        )
        setCatalog(installed)
        setActions(act?.actions || [])
        if (installed.length > 0) setTarget((prev) => prev || installed[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  const targetExt = catalog.find((e) => e.id === target)
  const toolDef = targetExt?.tools?.find((t) => t.name === tool)
  const props = toolDef?.parameters?.properties || {}

  function selectTarget(next: string) {
    setTarget(next)
    const ext = catalog.find((e) => e.id === next)
    const first =
      ext?.tools?.find((t) => t.name !== 'get_actions' && t.name !== 'set_actions') || ext?.tools?.[0]
    setTool(first?.name || '')
    setDraftArgs(first ? defaultArgsFor(first) : {})
  }

  function selectTool(next: string) {
    setTool(next)
    setDraftArgs(defaultArgsFor(targetExt?.tools?.find((t) => t.name === next)))
  }

  function defaultArgsFor(def?: ShTool): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [key, param] of Object.entries(def?.parameters?.properties || {})) {
      const d = param && param.default
      // Não pré-preenche placeholders {token} vindos do schema de outra
      // extensão (ex.: {event.imageDataUri} do Vision no Smart Home).
      out[key] = typeof d === 'string' && d.includes('{') ? '' : (d ?? '')
    }
    return out
  }

  function persist(next: ShAction[]) {
    setActions(next)
    setSaveState('saving')
    sendCommand('set_actions', { actions: next })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
  }

  function startEdit(a: ShAction) {
    setEditingId(a.id || null)
    setTarget(a.target)
    setTool(a.tool)
    setDraftArgs(cleanSavedArgs(a.args))
    setDraftWhen(a.when ? { ...a.when } : {})
    setShowDraft(true)
  }

  function cancelDraft() {
    setShowDraft(false)
    setEditingId(null)
  }

  function saveDraft() {
    if (!target || !tool) return
    const clean: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(draftArgs)) {
      if (typeof value === 'string' && !value.trim()) continue
      clean[key] = value
    }
    const cleanWhen: ShWhen = {}
    for (const key of ['device', 'room', 'state', 'domain'] as const) {
      const value = draftWhen[key]
      if (typeof value === 'string' && value.trim()) cleanWhen[key] = value.trim()
    }
    const entry: ShAction = {
      id: editingId || `act-${Date.now()}`,
      target,
      tool,
      args: Object.keys(clean).length ? clean : undefined,
      when: Object.keys(cleanWhen).length ? cleanWhen : undefined
    }
    const next = editingId
      ? actions.map((a) => (a.id === editingId ? entry : a))
      : [...actions, entry]
    persist(next)
    cancelDraft()
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: '#09090b'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Automações</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: 20 }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#a1a1aa' }}>
            Ações executadas automaticamente quando um dispositivo mudar de estado. Defina o
            gatilho de cada ação (ex.: luz da sala ligou → enviar mensagem no WhatsApp).
          </p>

          {loading ? (
            <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>Carregando…</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>Ações</span>
                <button
                  onClick={showDraft ? cancelDraft : () => setShowDraft(true)}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#34d399',
                    background: 'transparent',
                    border: '1px solid rgba(52,211,153,0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer'
                  }}
                >
                  {showDraft ? 'Cancelar' : '+ Adicionar ação'}
                </button>
              </div>

              {actions.length === 0 && !showDraft ? (
                <p style={{ margin: 0, fontSize: 11, color: '#71717a' }}>
                  Nenhuma automação. Campos disponíveis:{' '}
                  {SH_PLACEHOLDERS.map((p) => p.token).join(', ')}
                </p>
              ) : null}

              {actions.map((a, i) => (
                <div
                  key={a.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '8px 12px'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#f4f4f5' }}>
                      {catalog.find((e) => e.id === a.target)?.name || a.target}
                      <span style={{ color: '#a1a1aa' }}> / </span>
                      {SH_TOOL_LABELS[a.tool] || shHumanize(a.tool)}
                    </div>
                    {a.when && Object.keys(a.when).length > 0 ? (
                      <div style={{ fontSize: 11, color: '#34d399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Quando: {shFormatWhen(a.when)}
                      </div>
                    ) : null}
                    {a.args && Object.keys(a.args).length > 0 ? (
                      <div style={{ fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shFormatArgs(a.args)}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => startEdit(a)}
                      title="Editar"
                      aria-label="Editar"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#71717a',
                        cursor: 'pointer',
                        fontSize: 13,
                        padding: '4px',
                        display: 'flex'
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => persist(actions.filter((_, j) => j !== i))}
                      style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 14 }}
                      aria-label="Remover"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {showDraft ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 12
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                      Gatilho (quando executar)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                          Dispositivo
                        </label>
                        <ShSearchableInput
                          target="momaismarthome"
                          paramKey="device_name"
                          value={draftWhen.device ?? ''}
                          onChange={(v) => setDraftWhen((d) => ({ ...d, device: v }))}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                          Cômodo
                        </label>
                        <input
                          type="text"
                          value={draftWhen.room ?? ''}
                          onChange={(e) => setDraftWhen((d) => ({ ...d, room: e.target.value }))}
                          placeholder="Qualquer"
                          style={shInputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                          Estado
                        </label>
                        <select
                          value={draftWhen.state ?? ''}
                          onChange={(e) => setDraftWhen((d) => ({ ...d, state: e.target.value }))}
                          style={shSelectStyle}
                        >
                          <option value="">Qualquer</option>
                          <option value="on">Ligado (on)</option>
                          <option value="off">Desligado (off)</option>
                        </select>
                      </div>
                      <p style={{ margin: 0, fontSize: 10, color: '#71717a' }}>
                        Deixe vazio para rodar com qualquer mudança de estado.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                      Extensão alvo
                    </label>
                    <select
                      value={target}
                      onChange={(e) => selectTarget(e.target.value)}
                      style={shSelectStyle}
                    >
                      {catalog.length === 0 ? <option value="">Nenhuma extensão com ações instalada</option> : null}
                      {catalog.map((ext) => (
                        <option key={ext.id} value={ext.id}>
                          {ext.name || ext.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {toolDef ? (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>Ação</label>
                        <select
                          value={tool}
                          onChange={(e) => selectTool(e.target.value)}
                          style={shSelectStyle}
                        >
                          {targetExt?.tools
                            ?.filter((t) => t.name !== 'get_actions' && t.name !== 'set_actions')
                            .map((t) => (
                              <option key={t.name} value={t.name}>
                                {SH_TOOL_LABELS[t.name] || shHumanize(t.name)}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {Object.entries(props).map(([key, param]) => (
                          <div key={key}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a1a1aa', marginBottom: 4 }}>
                              {SH_PARAM_LABELS[key] || shHumanize(key)}
                              {param?.default !== undefined ? ' (pré-preenchido)' : ''}
                            </label>
                            {param?.enum ? (
                              <select
                                value={String(draftArgs[key] ?? '')}
                                onChange={(e) => setDraftArgs((d) => ({ ...d, [key]: e.target.value }))}
                                style={shSelectStyle}
                              >
                                {param.enum.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : SH_ENTITY_PARAMS.has(key) ? (
                              <ShSearchableInput
                                target={target}
                                paramKey={key}
                                value={String(draftArgs[key] ?? '')}
                                onChange={(v) => setDraftArgs((d) => ({ ...d, [key]: v }))}
                              />
                            ) : (
                              <input
                                type="text"
                                value={String(draftArgs[key] ?? '')}
                                onChange={(e) => setDraftArgs((d) => ({ ...d, [key]: e.target.value }))}
                                placeholder={param?.description || ''}
                                style={shInputStyle}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {SH_PLACEHOLDERS.map((p) => (
                          <button
                            key={p.token}
                            onClick={() =>
                              setDraftArgs((d) => {
                                const firstEmpty = Object.keys(props).find((k) => !String(d[k] ?? '').trim())
                                if (!firstEmpty) return d
                                return { ...d, [firstEmpty]: p.token }
                              })
                            }
                            style={{
                              fontSize: 10,
                              color: '#a1a1aa',
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 8,
                              padding: '2px 8px',
                              cursor: 'pointer'
                            }}
                          >
                            {p.label} {p.token}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={saveDraft}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#fff',
                          background: '#059669',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        {editingId ? 'Salvar alterações' : 'Usar esta ação'}
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}
        >
          <span
            style={{
              fontSize: 11,
              color:
                saveState === 'error'
                  ? '#f87171'
                  : saveState === 'saved'
                    ? '#34d399'
                    : '#71717a'
            }}
          >
            {saveState === 'saving'
              ? 'Salvando…'
              : saveState === 'saved'
                ? 'Salvo automaticamente'
                : saveState === 'error'
                  ? 'Erro ao salvar. Tente novamente.'
                  : 'As ações são salvas automaticamente.'}
          </span>
          <button
            onClick={onClose}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: '#059669',
              border: 'none',
              borderRadius: 10,
              padding: '8px 20px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

const shSelectStyle: React.CSSProperties = {
  width: '100%',
  background: '#27272a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  color: '#f4f4f5',
  outline: 'none'
}

const shInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#27272a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  color: '#f4f4f5',
  outline: 'none',
  boxSizing: 'border-box'
}

function ShSearchableInput({
  paramKey,
  target,
  value,
  onChange
}: {
  paramKey: string
  target: string
  value: string
  onChange: (v: string) => void
}) {
  const [options, setOptions] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const listTool = paramKey === 'contact' ? 'get_wa_contacts' : paramKey === 'device_name' ? 'list_devices' : null
    if (!listTool) return
    extFetch(`/extensions/${target}/command`, { toolName: listTool, args: {} })
      .then((res) => {
        if (cancelled) return
        const items = paramKey === 'contact' ? res?.contacts : res?.devices
        const names = (items || [])
          .map((c: any) => (paramKey === 'contact' ? c.name || c.notify || c.phone || '' : String(c.name || '')))
          .filter(Boolean) as string[]
        setOptions(Array.from(new Set(names)))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [paramKey, target])

  const filtered = value.trim() ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase())) : options

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={options.length > 0 ? 'Digite para buscar…' : 'Digite nome ou número'}
        style={shInputStyle}
      />
      {open && filtered.length > 0 ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            top: '100%',
            left: 0,
            width: '100%',
            maxHeight: 160,
            overflowY: 'auto',
            background: '#27272a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          {filtered.slice(0, 30).map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(opt)
                setOpen(false)
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                fontSize: 12,
                color: '#e4e4e7',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function SmartHomePage() {
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_CONNS_KEY) : null
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [devices, setDevices] = useState<Device[]>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_DEVICES_KEY) : null
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(CACHE_CONNECTED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [hasSavedConnection, setHasSavedConnection] = useState<boolean>(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(CACHE_HAS_SAVED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const savedDevs = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_DEVICES_KEY) : null
      return !savedDevs
    } catch {
      return true
    }
  })

  // Single filter state: 'controllable' | 'sensors' | room name
  const [activeFilter, setActiveFilter] = useState<string>('controllable')

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showAutomations, setShowAutomations] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [haUrl, setHaUrl] = useState('http://homeassistant.local:8123')
  const [haToken, setHaToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  // Timeout de UI: se a primeira checagem falhou/travou (worker/node-core sem
  // resposta), sai do "Carregando" após ~8s para a UI mostrar o card de
  // desconectado (quando há conexão salva) ou o formulário de conexão.
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setLoading(false), 8000)
    return () => clearTimeout(t)
  }, [loading])

  // Auto-sync: 5s quando conectado, ~20s quando offline (só para detectar a
  // volta do servidor). Polling agressivo com HA offline gerava uma cascata de
  // timeouts/cooldowns a cada 5s; o SSE já cobre atualizações em tempo real.
  useEffect(() => {
    if (!hasSavedConnection) return

    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      try {
        const status = await api.getStatus()
        const haProvider = status?.providerStatus?.providers?.homeassistant
        const connected = Boolean(status?.connected && (haProvider?.connected !== false))

        setIsConnected(connected)
        if (!connected) {
          setDevices([])
          if (status?.lastError || haProvider?.error) {
            setConnectError(status?.lastError || haProvider?.error || null)
          }
        } else {
          setConnectError(null)
          const devs = await api.getDevices()
          if (Array.isArray(devs)) {
            const deduplicated = deduplicateDevicesByName(devs)
            setDevices(deduplicated)
          }
        }
        timer = setTimeout(tick, connected ? 5000 : 20000)
      } catch (err) {
        console.warn('[SmartHome] Erro na sincronização periódica:', err)
        timer = setTimeout(tick, 20000)
      }
    }

    tick()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [hasSavedConnection])

  // Listen for real-time state_changed & connection_changed events via SSE stream
  useEffect(() => {
    if (!hasSavedConnection) return

    let eventSource: EventSource | null = null

    try {
      const sseUrl = `${getApiBase()}/extensions/events`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'extension_event') {
            if (payload.eventType === 'connection_changed') {
              const connected = Boolean(payload.data?.connected)
              setIsConnected(connected)
              if (!connected) {
                setDevices([])
                if (payload.data?.error) setConnectError(payload.data.error)
              } else {
                setConnectError(null)
                api.getDevices().then((devs) => {
                  if (Array.isArray(devs)) setDevices(deduplicateDevicesByName(devs))
                }).catch(() => {})
              }
            } else if (payload.eventType === 'state_changed') {
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
  }, [hasSavedConnection])

  const handleResync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const status = await api.getStatus()
      const haProvider = status?.providerStatus?.providers?.homeassistant
      const connected = Boolean(status?.connected && (haProvider?.connected !== false))
      setIsConnected(connected)
      if (connected) {
        setConnectError(null)
        const devs = await api.syncDevices()
        const deduplicated = deduplicateDevicesByName(devs)
        setDevices(deduplicated)
      } else {
        setDevices([])
        setConnectError(status?.lastError || haProvider?.error || 'Servidor indisponível ou offline')
      }
    } catch (err: any) {
      console.warn('[SmartHome] Erro na resincronização manual:', err)
      setConnectError(err.message || 'Falha ao tentar reconectar')
    } finally {
      setIsSyncing(false)
    }
  }

  const fetchLastConnection = async () => {
    try {
      const last = await api.getLastConnection()
      if (last && typeof last === 'object' && last.url) {
        setHaUrl(last.url)
        if (last.token) setHaToken(last.token)
        setHasSavedConnection(true)
      } else {
        setHaUrl('http://homeassistant.local:8123')
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao buscar última conexão:', err)
      setHaUrl('http://homeassistant.local:8123')
    }
  }

  const loadStatus = async () => {
    if (devices.length === 0) {
      setLoading(true)
    }
    try {
      const conns = await api.listConnections()
      const connsOk = Array.isArray(conns)
      if (connsOk) {
        setConnections(conns)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CACHE_CONNS_KEY, JSON.stringify(conns))
        }
      }
      await fetchLastConnection()

      // Só conclui "não há conexão salva" quando o backend respondeu de fato;
      // se listConnections falhou/timeout (worker morto), mantém o valor em
      // cache — senão a página mostraria o formulário em vez do desconectado.
      const hasSaved = connsOk ? Boolean(conns && conns.length > 0) : hasSavedConnection
      setHasSavedConnection(hasSaved)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_HAS_SAVED_KEY, hasSaved ? 'true' : 'false')
      }

      const status = await api.getStatus()

      // Só marca como conectado se o worker realmente conectou no HA.
      const haProvider = status?.providerStatus?.providers?.homeassistant
      const connected = Boolean(status?.connected && (haProvider?.connected !== false))
      setIsConnected(connected)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_CONNECTED_KEY, connected ? 'true' : 'false')
      }

      // Mostra o erro real (token inválido / servidor offline) na tela de conexão.
      if (!connected) {
        if (status?.lastError || haProvider?.error) {
          setConnectError(status?.lastError || haProvider?.error || null)
        }
      } else {
        setConnectError(null)
      }

      const devs = await api.getDevices()
      const deduplicated = deduplicateDevicesByName(devs || [])
      setDevices(deduplicated)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_DEVICES_KEY, JSON.stringify(deduplicated))
      }
    } catch (err) {
      console.warn('[SmartHome] Erro ao carregar status:', err)
    } finally {
      setLoading(false)
    }
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
        setHasSavedConnection(true)
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
      const result = await api.disconnectAll()
      if (result?.ok === false || result?.success === false) {
        throw new Error(result.error || result.message || 'Falha ao desconectar')
      }
      setIsConnected(false)
      setHasSavedConnection(false)
      setDevices([])
      setConnections([])
      setSelectedDevice(null)
      setConnectError(null)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CACHE_CONNS_KEY)
        localStorage.removeItem(CACHE_DEVICES_KEY)
        localStorage.removeItem(CACHE_CONNECTED_KEY)
        localStorage.removeItem(CACHE_HAS_SAVED_KEY)
      }
    } catch (err: any) {
      console.warn('[SmartHome] Erro ao desconectar:', err)
      setConnectError(err.message || 'Falha ao desconectar')
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
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  className="sh-input"
                  type={showToken ? 'text' : 'password'}
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  value={haToken}
                  onChange={(e) => setHaToken(e.target.value)}
                  style={{ paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? 'Ocultar token' : 'Mostrar token'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#a78bfa',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showToken ? <SvgEyeOff size={16} /> : <SvgEye size={16} />}
                </button>
              </div>
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

      {loading && !hasSavedConnection ? (
        <div className="sh-auth"><p style={{ color: '#94a3b8' }}>Carregando...</p></div>
      ) : !hasSavedConnection ? (
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
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    className="sh-auth-input"
                    type={showToken ? 'text' : 'password'}
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIs..."
                    value={haToken}
                    onChange={(e) => setHaToken(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    title={showToken ? 'Ocultar token' : 'Mostrar token'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#c084fc',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showToken ? <SvgEyeOff size={16} /> : <SvgEye size={16} />}
                  </button>
                </div>
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
          {/* Header: Home Assistant Status & Actions */}
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

              <div className={`sh-badge ${!isConnected ? 'sh-badge-offline' : ''}`}>
                <span className="sh-dot" />
                <span>{isConnected ? 'Home Assistant' : 'Offline'}</span>
              </div>

              <button className="sh-btn sh-btn-danger" onClick={handleDisconnectAll}>
                <SvgLogout size={15} />
                Desconectar
              </button>
            </div>
          </div>

          {!isConnected ? (
            /* RECONNECTING CARD WHEN HOME ASSISTANT IS OFFLINE */
            <div className="sh-reconnect-container">
              <div className="sh-reconnect-card">
                <div className="sh-reconnect-icon-box">
                  <SvgAlert size={28} color="#ef4444" />
                </div>
                <h2 className="sh-reconnect-title">Home Assistant Indisponível</h2>
                <p className="sh-reconnect-sub">
                  Não foi possível estabelecer conexão com o servidor. Verifique se o Home Assistant está ligado e acessível na rede.
                </p>

                {haUrl && (
                  <div className="sh-reconnect-url-tag">
                    <SvgWifi size={13} color="#a78bfa" />
                    <span>{haUrl}</span>
                  </div>
                )}

                {connectError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#fca5a5',
                    fontSize: '12px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {connectError}
                  </div>
                )}

                <div className="sh-reconnect-actions">
                  <button
                    className="sh-btn-primary"
                    onClick={handleResync}
                    disabled={isSyncing}
                    style={{ padding: '10px 18px', fontSize: '13px' }}
                  >
                    <SvgRefresh size={15} className={isSyncing ? 'sh-spin' : ''} />
                    <span>{isSyncing ? 'Tentando Reconectar...' : 'Tentar Reconectar Agora'}</span>
                  </button>

                  <button
                    className="sh-btn sh-btn-danger"
                    onClick={handleDisconnectAll}
                    style={{ padding: '10px 16px', fontSize: '13px' }}
                  >
                    <SvgLogout size={15} />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="sh-auth"><p style={{ color: '#94a3b8' }}>Carregando...</p></div>
          ) : (
            <>
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
                        onClick={() => {
                          setSelectedDevice(device)
                        }}
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
        </>
      )}
    </div>
  )
}
