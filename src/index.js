const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {}

const DatabaseManager = require('./database/database');
const TokenManager = require('./auth/tokenManager');
const HomeAssistantAuth = require('./auth/haAuth');
const DeviceManager = require('./integrations/deviceManager');

class MomAIHomeConnector {
  constructor(options = {}) {
    this.dbManager = new DatabaseManager(options.dbPath);
    this.tokenManager = new TokenManager(this.dbManager);
    this.auth = new HomeAssistantAuth(options.authOptions);
    this.devices = new DeviceManager();

    this.isConnected = false;
    this.connections = [];
  }

  async init() {
    await this.dbManager.init();
    const conns = await this.tokenManager.listConnections();

    for (const conn of conns) {
      try {
        const full = await this.tokenManager.getConnection(conn.id);
        if (!full) continue;

        const result = await this.devices.registerProvider(full.providerType, full.config);
        if (result.success) {
          this.connections.push({ id: full.id, type: full.providerType, name: full.name, email: full.email });
          this.isConnected = true;
        }
      } catch (err) {
        console.warn(`[MomAIHomeConnector] Falha ao restaurar conexão ${conn.id}:`, err.message);
      }
    }

    return this.getStatus();
  }

  async connectToHomeAssistant(url, token, name) {
    await this.dbManager.init();
    this.auth.setCredentials(url, token);

    const connectionId = 'ha_' + Date.now();
    const displayName = name || 'Home Assistant';

    const result = await this.devices.registerProvider('homeassistant', { url, token });

    await this.tokenManager.saveConnection(
      connectionId,
      'homeassistant',
      this.auth.toConfig(),
      displayName,
      'local'
    );

    const entities = await this.devices.listDevices('homeassistant');
    await this.tokenManager.cacheEntities(connectionId, entities);

    this.connections.push({ id: connectionId, type: 'homeassistant', name: displayName, email: 'local' });
    this.isConnected = true;

    return { connectionId, ...result };
  }

  async listConnections() {
    return this.tokenManager.listConnections();
  }

  async getDevices(connectionId) {
    const status = this.devices.getStatus();
    if (Object.keys(status.providers).length === 0) return [];

    if (connectionId) {
      const conn = this.connections.find((c) => c.id === connectionId);
      if (conn) return this.devices.listDevices(conn.type);
      return [];
    }

    return this.devices.listDevices();
  }

  async turnOnDevice(deviceId, connectionType) {
    return this.devices.turnOn(deviceId, connectionType);
  }

  async turnOffDevice(deviceId, connectionType) {
    return this.devices.turnOff(deviceId, connectionType);
  }

  async callService(domain, service, data) {
    return this.devices.callService(domain, service, data);
  }

  async removeConnection(connectionId) {
    const conn = this.connections.find((c) => c.id === connectionId);
    if (conn) {
      await this.devices.unregisterProvider(conn.type);
      this.connections = this.connections.filter((c) => c.id !== connectionId);
    }
    await this.tokenManager.removeConnection(connectionId);
    this.isConnected = this.connections.length > 0;
    return { success: true };
  }

  async disconnectAll() {
    await this.devices.disconnectAll();
    this.connections = [];
    this.isConnected = false;
    return { success: true, message: 'Todas as conexões encerradas.' };
  }

  getStatus() {
    return {
      connected: this.isConnected,
      connections: this.connections.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name
      })),
      providerStatus: this.devices.getStatus()
    };
  }
}

const defaultInstance = new MomAIHomeConnector();
defaultInstance.MomAIHomeConnector = MomAIHomeConnector;

module.exports = defaultInstance;
