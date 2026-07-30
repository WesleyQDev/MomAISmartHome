const https = require('https')
const http = require('http')
const BaseProvider = require('../provider')

const HA_DOMAINS = {
  light: { name: 'Light', icon: 'lightbulb', services: ['turn_on', 'turn_off', 'toggle'] },
  switch: { name: 'Switch', icon: 'switch', services: ['turn_on', 'turn_off', 'toggle'] },
  fan: { name: 'Fan', icon: 'fan', services: ['turn_on', 'turn_off', 'toggle'] },
  cover: { name: 'Cover', icon: 'curtains', services: ['open_cover', 'close_cover', 'stop_cover'] },
  lock: { name: 'Lock', icon: 'lock', services: ['lock', 'unlock'] },
  climate: { name: 'Climate', icon: 'thermostat', services: ['set_temperature', 'set_hvac_mode'] },
  sensor: { name: 'Sensor', icon: 'sensor', services: [] },
  binary_sensor: { name: 'Binary Sensor', icon: 'motion', services: [] },
  media_player: { name: 'Media Player', icon: 'tv', services: ['turn_on', 'turn_off', 'volume_set'] },
  camera: { name: 'Camera', icon: 'camera', services: ['turn_on', 'turn_off'] },
  vacuum: { name: 'Vacuum', icon: 'vacuum', services: ['start', 'stop', 'return_to_base'] },
  scene: { name: 'Scene', icon: 'palette', services: ['turn_on'] },
  automation: { name: 'Automation', icon: 'autorenew', services: ['turn_on', 'turn_off', 'toggle'] },
  alarm_control_panel: { name: 'Alarm', icon: 'security', services: ['alarm_arm_away', 'alarm_arm_home', 'alarm_disarm'] }
}

class HomeAssistantProvider extends BaseProvider {
  constructor(config = {}) {
    super(config)
    this.name = 'Home Assistant'
    this.url = config.url || process.env.HA_URL || 'http://homeassistant.local:8123'
    this.token = config.token || process.env.HA_TOKEN || ''
    this.cachedDevices = new Map()
  }

  _get(urlPath) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ''))
      const isHttps = parsedUrl.protocol === 'https:'
      const transport = isHttps ? https : http

      const req = transport.request(
        parsedUrl.toString(),
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else {
              reject(new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`))
            }
          })
        }
      )
      req.on('error', reject)
      req.end()
    })
  }

  _post(urlPath, payload = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlPath, this.url.replace(/\/$/, ''))
      const isHttps = parsedUrl.protocol === 'https:'
      const transport = isHttps ? https : http
      const postData = JSON.stringify(payload)

      const req = transport.request(
        parsedUrl.toString(),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          let body = ''
          res.on('data', (chunk) => (body += chunk))
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(body)) } catch { resolve(null) }
            } else {
              reject(new Error(`HA API error ${res.statusCode}: ${body.slice(0, 200)}`))
            }
          })
        }
      )
      req.on('error', reject)
      req.write(postData)
      req.end()
    })
  }

  async connect() {
    if (!this.token) {
      throw new Error('Home Assistant token is required')
    }
    try {
      const config = await this._get('/api/config')
      this.connected = true
      return {
        success: true,
        message: `Conectado ao Home Assistant (${config.version || 'desconhecido'})`,
        providerName: this.name,
        version: config.version,
        locationName: config.location_name
      }
    } catch (err) {
      this.connected = false
      throw new Error(`Falha ao conectar ao Home Assistant em ${this.url}: ${err.message}`)
    }
  }

  async disconnect() {
    this.connected = false
    this.cachedDevices.clear()
    return { success: true, message: 'Desconectado do Home Assistant' }
  }

  async listDevices() {
    if (!this.connected) return []

    try {
      const states = await this._get('/api/states')
      const devices = states
        .filter((s) => {
          const domain = s.entity_id?.split('.')[0]
          return HA_DOMAINS[domain] || s.attributes?.friendly_name
        })
        .map((s) => this._normalizeEntity(s))

      this.cachedDevices.clear()
      devices.forEach((d) => this.cachedDevices.set(d.id, d))
      return devices
    } catch (err) {
      console.warn('[HAProvider] Erro ao listar dispositivos:', err.message)
      return Array.from(this.cachedDevices.values())
    }
  }

  async turnOn(deviceId, params = {}) {
    const device = this.cachedDevices.get(deviceId)
    if (!device) return { success: false, error: 'Dispositivo não encontrado' }

    const domain = deviceId.split('.')[0]
    try {
      await this._post(`/api/services/${domain}/turn_on`, { entity_id: deviceId, ...params })
      if (device.state) device.state.on = true
      this.cachedDevices.set(deviceId, device)
      return { success: true, deviceId, action: 'turnOn' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async turnOff(deviceId, params = {}) {
    const device = this.cachedDevices.get(deviceId)
    if (!device) return { success: false, error: 'Dispositivo não encontrado' }

    const domain = deviceId.split('.')[0]
    try {
      await this._post(`/api/services/${domain}/turn_off`, { entity_id: deviceId, ...params })
      if (device.state) device.state.on = false
      this.cachedDevices.set(deviceId, device)
      return { success: true, deviceId, action: 'turnOff' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async callService(domain, service, data = {}) {
    if (!this.connected) throw new Error('Not connected to Home Assistant')
    return this._post(`/api/services/${domain}/${service}`, data)
  }

  async getHistory(entityId, startTime) {
    const start = startTime || new Date(Date.now() - 86400000).toISOString()
    return this._get(`/api/history/period/${start}?filter_entity_id=${entityId}`)
  }

  _normalizeEntity(state) {
    const domain = state.entity_id?.split('.')[0]
    const domainInfo = HA_DOMAINS[domain] || { name: domain, icon: 'help' }
    const attrs = state.attributes || {}

    const normalized = {
      id: state.entity_id,
      name: attrs.friendly_name || state.entity_id,
      type: domainInfo.name,
      domain,
      icon: domainInfo.icon,
      provider: this.name,
      room: attrs.area_id || attrs.area || '',
      online: true,
      state: { on: state.state === 'on' },
      attributes: {}
    }

    if (domain === 'light') {
      normalized.state.brightness = attrs.brightness ? Math.round((attrs.brightness / 255) * 100) : null
      normalized.state.colorTemp = attrs.color_temp || null
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'climate') {
      normalized.state.temperature = attrs.current_temperature || null
      normalized.state.targetTemperature = attrs.temperature || null
      normalized.state.hvacMode = state.state
      normalized.state.hvacModes = attrs.hvac_modes || []
      normalized.attributes.supported = domainInfo.services
    } else if (domain === 'cover') {
      normalized.state.position = attrs.current_position ?? null
      normalized.state.isOpen = state.state === 'open'
    } else if (domain === 'sensor') {
      normalized.state.value = state.state
      normalized.state.unit = attrs.unit_of_measurement || ''
    } else if (domain === 'lock') {
      normalized.state.locked = state.state === 'locked'
    } else if (domain === 'media_player') {
      normalized.state.volume = attrs.volume_level || null
      normalized.state.source = attrs.source || null
      normalized.state.mediaTitle = attrs.media_title || null
    }

    return normalized
  }
}

module.exports = HomeAssistantProvider
