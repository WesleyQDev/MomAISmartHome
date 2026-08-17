class HomeAssistantAuth {
  constructor(options = {}) {
    this.url = options.url || process.env.HA_URL || 'http://homeassistant.local:8123'
    this.token = options.token || process.env.HA_TOKEN || ''
  }

  setCredentials(url, token) {
    this.url = url
    this.token = token
  }

  getUrl() {
    return this.url
  }

  getToken() {
    return this.token
  }

  isConfigured() {
    return Boolean(this.url && this.token)
  }

  toConfig() {
    return { url: this.url, token: this.token }
  }

  static fromConfig(config) {
    return new HomeAssistantAuth(config)
  }
}

module.exports = HomeAssistantAuth
