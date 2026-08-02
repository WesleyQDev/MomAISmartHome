import React from 'react'
import { DeviceControlCardContent, Device } from './components/DeviceControlContent'
import { SmartHomeStyles } from './styles'

export function SmartHomePanel(props: any) {
  const data = props?.data || props
  const device = data?.device

  const handleClose = () => {
    let closed = false
    if (typeof props?.onClose === 'function') {
      try {
        props.onClose()
        closed = true
      } catch {}
    }
    if (!closed && typeof data?.onClose === 'function') {
      try {
        data.onClose()
        closed = true
      } catch {}
    }
    if (typeof (window as any).momaiAPI?.closeOverlay === 'function') {
      try {
        ;(window as any).momaiAPI.closeOverlay()
      } catch {}
    }
    if (typeof (window as any).api?.closeOverlay === 'function') {
      try {
        ;(window as any).api.closeOverlay()
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
            const winApi = (window as any).api
            if (typeof winApi?.callService === 'function') {
              return winApi.callService(domain, service, serviceData, providerType || 'homeassistant')
            }
            const baseUrl = (winApi?.getApiBaseUrl && winApi.getApiBaseUrl()) || 'http://127.0.0.1:8050'
            const token = (winApi?.getSessionToken && winApi.getSessionToken()) || ''
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
                })
              })
              return await res.json()
            } catch (err) {
              console.error('[SmartHomePanel] Erro ao executar serviço:', err)
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
