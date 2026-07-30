import React, { useState, useEffect } from 'react'

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
}

interface EntityAttributes {
  supported?: string[]
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
  alarm_control_panel: '🔐'
}

interface BackendApi {
  connectToHomeAssistant(url: string, token: string, name?: string): Promise<any>
  getDevices(connectionId?: string): Promise<Device[]>
  turnOnDevice(deviceId: string, providerType?: string): Promise<any>
  turnOffDevice(deviceId: string, providerType?: string): Promise<any>
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
  listConnections: () => sendCommand('listConnections').then((r: any) => r.connections || []),
  disconnectAll: () => sendCommand('disconnectAll'),
  removeConnection: (connectionId) => sendCommand('removeConnection', { connectionId }),
  getStatus: () => sendCommand('getStatus')
}

export default function SmartHomePage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null)
  const [activeRoomFilter, setActiveRoomFilter] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
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
        setDevices(devs)
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
      if (result.success) {
        setShowConnectModal(false)
        setHaUrl('')
        setHaToken('')
        await loadStatus()
      } else {
        setConnectError(result.message || 'Falha ao conectar')
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
    if (device.state.on) {
      await api.turnOffDevice(device.id, providerType)
    } else {
      await api.turnOnDevice(device.id, providerType)
    }
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, state: { ...d.state, on: !d.state.on } } : d)))
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
    if (activeCategoryFilter && d.domain !== activeCategoryFilter) return false
    if (activeRoomFilter && d.room !== activeRoomFilter) return false
    return true
  })

  const activeCount = (domain: string) => devices.filter((d) => d.domain === domain && d.state.on).length
  const totalCount = (domain: string) => devices.filter((d) => d.domain === domain).length

  return (
    <div className="sh-root">
      <style>{`
        .sh-root {
          background-color: #141519; color: #e2e2e6;
          min-height: 100vh; padding: 36px 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }
        .sh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .sh-title { font-size: 28px; font-weight: 700; color: #f1f0f4; display: flex; align-items: center; gap: 12px; margin: 0; }
        .sh-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .sh-btn { background: #1f2128; border: none; color: #a8c7fa; padding: 10px 18px; border-radius: 9999px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .sh-btn:hover { background: #2b2d37; color: #fff; }
        .sh-btn-primary { background: #a8c7fa; color: #042e6f; border: none; padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .sh-btn-primary:hover { background: #c2e7ff; }
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
        .sh-chips { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 24px; scrollbar-width: none; }
        .sh-chip { display: flex; align-items: center; gap: 8px; background: #1f2128; border: none; padding: 10px 18px; border-radius: 9999px; font-size: 13px; font-weight: 500; color: #c4c6d0; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .sh-chip:hover { background: #2b2d37; color: #fff; }
        .sh-chip.active { background: #1a2e3a; color: #7dd3fc; }
        .sh-section { font-size: 19px; font-weight: 600; color: #f1f0f4; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 44px; }
        .sh-card { background: #1f2128; border: none; border-radius: 28px; padding: 22px; transition: all 0.3s; position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 155px; cursor: pointer; box-sizing: border-box; }
        .sh-card:hover { transform: translateY(-2px); background: #262932; box-shadow: 0 16px 32px rgba(0,0,0,0.35); }
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
          {devices.length > 0 && (
            <>
              <div className="sh-chips">
                <button className={`sh-chip ${!activeCategoryFilter ? 'active' : ''}`} onClick={() => { setActiveCategoryFilter(null); setActiveRoomFilter(null) }}>
                  Todos ({devices.length})
                </button>
                {['light', 'climate', 'sensor', 'lock', 'cover', 'media_player', 'camera', 'switch'].filter((d) => devices.some((dd) => dd.domain === d)).map((domain) => (
                  <button key={domain} className={`sh-chip ${activeCategoryFilter === domain ? 'active' : ''}`} onClick={() => setActiveCategoryFilter(activeCategoryFilter === domain ? null : domain)}>
                    {DOMAIN_ICONS[domain] || '⚙️'} {domain === 'media_player' ? 'Mídia' : domain.charAt(0).toUpperCase() + domain.slice(1)} ({activeCount(domain)}/{totalCount(domain)})
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
            <span>{filteredDevices.length} dispositivo{filteredDevices.length !== 1 ? 's' : ''}</span>
          </div>
          {filteredDevices.length === 0 ? (
            <div className="sh-empty">
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🏠</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f0f4', margin: '0 0 8px' }}>
                Nenhum dispositivo encontrado
              </h3>
              <p style={{ fontSize: '14px', color: '#9aa0a6', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
                {connections.length > 0 ? 'Seus dispositivos do Home Assistant aparecerão aqui após a sincronização.' : 'Conecte-se ao Home Assistant para gerenciar seus dispositivos inteligentes.'}
              </p>
            </div>
          ) : (
            <div className="sh-grid">
              {filteredDevices.map((device) => (
                <div key={device.id} className={`sh-card ${device.state.on ? 'on' : ''} ${device.domain}`}>
                  <div className="sh-card-header">
                    <div className="sh-icon">{DOMAIN_ICONS[device.domain] || '⚙️'}</div>
                    <label className="sh-toggle" onClick={(e) => e.stopPropagation()}>
                      {['switch', 'light', 'fan', 'media_player', 'vacuum', 'automation', 'scene', 'camera'].includes(device.domain) && (
                        <>
                          <input type="checkbox" checked={device.state.on} onChange={() => toggleDevice(device)} />
                          <span className="sh-slider" />
                        </>
                      )}
                    </label>
                  </div>
                  <div className="sh-body">
                    <h3 className="sh-name">{device.name}</h3>
                    <p className="sh-sub">{device.room ? `${device.room} • ` : ''}{device.provider}</p>
                    {device.domain === 'light' && device.state.on && device.state.brightness != null && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ffe082', fontWeight: 600, marginTop: '10px' }}>
                          <span>Brilho</span><span>{device.state.brightness}%</span>
                        </div>
                        <div className="sh-bar" onClick={() => setBrightness(device, device.state.brightness! > 50 ? 25 : 75)}>
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
                      <p style={{ fontSize: '14px', color: '#a8c7fa', fontWeight: 600, marginTop: '8px' }}>
                        {device.state.value}{device.state.unit ? ` ${device.state.unit}` : ''}
                      </p>
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
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
