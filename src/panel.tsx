import React from 'react'
import { DeviceControlCardContent, Device } from './components/DeviceControlContent'
import { SmartHomeStyles } from './styles'

export function SmartHomePanel(props: any) {
  const data = props?.data || props
  const device = data?.device

  const handleClose = () => {
    // Fecha apenas a overlay deste device (device.id) — um único IPC. Chamadas
    // redundantes ou sem id faziam o host fechar também a última overlay criada.
    const closeOverlay = (window as any)?.momaiAPI?.closeOverlay || (window as any)?.api?.closeOverlay
    if (typeof closeOverlay === 'function') {
      try {
        closeOverlay({ overlayId: device?.id })
      } catch {}
    }
  }

  return (
    <>
      <SmartHomeStyles />
      {!device ? (
        <div
          className="sh-modal-detail"
          style={{
            WebkitAppRegion: 'drag',
            padding: '24px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative'
          } as any}
        >
          <button
            className="sh-modal-close-btn"
            style={{ WebkitAppRegion: 'no-drag', cursor: 'pointer', zIndex: 99999 } as any}
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
          >
            ✕
          </button>
          <p style={{ fontSize: '14px', color: '#9aa0a6', margin: '20px 0 0' }}>
            Nenhum dispositivo selecionado para exibição.
          </p>
        </div>
      ) : (
        <DeviceControlCardContent
          device={device}
          allDevices={data?.allDevices || []}
          onClose={handleClose}
          callServiceApi={async (domain, service, serviceData, providerType) => {
            const winApi = (window as any).api || (window as any).momaiAPI
            if (typeof winApi?.callService === 'function') {
              return winApi.callService(domain, service, serviceData, providerType || 'homeassistant')
            }
            const baseUrl = (winApi?.getApiBaseUrl && winApi.getApiBaseUrl()) || 'http://127.0.0.1:8050'
            const token = (winApi?.getSessionToken && winApi.getSessionToken()) || ''
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 10000)
            try {
              const res = await fetch(`${baseUrl}/extensions/momaismarthome/command`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Session-Token': token
                },
                body: JSON.stringify({
                  toolName: 'callService',
                  args: { domain, service, data: serviceData, providerType: providerType || 'homeassistant' }
                }),
                signal: controller.signal
              })
              return await res.json()
            } catch (err) {
              console.error('[SmartHomePanel] Erro ao executar serviço:', err)
            } finally {
              clearTimeout(timer)
            }
          }}
          isOverlay={true}
        />
      )}
    </>
  )
}

const registerRenderer = (type: string, component: any) => {
  if (typeof window !== 'undefined' && (window as any).__skillRendererRegistry?.registerRenderer) {
    ;(window as any).__skillRendererRegistry.registerRenderer(type, component)
  }
}

registerRenderer('momaismarthome-panel', SmartHomePanel)
export default SmartHomePanel
