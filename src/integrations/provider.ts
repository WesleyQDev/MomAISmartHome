const { EventEmitter } = require('events')

class BaseProvider extends EventEmitter {
  constructor(config = {}) {
    super()
    this.config = config
    this.connected = false
    this.name = 'generic'
  }

  async connect() {
    throw new Error('connect() must be implemented by subclass')
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass')
  }

  async listDevices() {
    throw new Error('listDevices() must be implemented by subclass')
  }

  async turnOn(deviceId, params = {}) {
    throw new Error('turnOn() must be implemented by subclass')
  }

  async turnOff(deviceId, params = {}) {
    throw new Error('turnOff() must be implemented by subclass')
  }

  async getStatus() {
    return { connected: this.connected, name: this.name }
  }
}

module.exports = BaseProvider

