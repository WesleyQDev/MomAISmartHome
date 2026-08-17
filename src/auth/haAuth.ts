class HomeAssistantAuth {
  url: string = ''
  token: string = ''

  constructor(options: any = {}) {
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
}

module.exports = HomeAssistantAuth
