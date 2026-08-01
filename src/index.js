const path = require('path');
const { EventEmitter } = require('events');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {}

const DatabaseManager = require('./database/database');
const TokenManager = require('./auth/tokenManager');
const HomeAssistantAuth = require('./auth/haAuth');
const DeviceManager = require('./integrations/deviceManager');

class MomAIHomeConnector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.dbManager = new DatabaseManager(options.dbPath);
    this.tokenManager = new TokenManager(this.dbManager);
    this.auth = new HomeAssistantAuth(options.authOptions);
    this.devices = new DeviceManager();

    if (typeof this.devices.on === 'function') {
      this.devices.on('state_changed', (data) => {
        this.emit('state_changed', data);
      });
    }

    this.isConnected = false;
    this.connections = [];
  }

  async init(momai) {
    if (momai?.storage?.storageDir && this.dbManager) {
      const customDbPath = path.join(momai.storage.storageDir, 'smarthome.sqlite');
      if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
        await this.dbManager.close();
      }
      this.dbManager.dbPath = customDbPath;
    }
    await this.dbManager.init();
    const conns = await this.tokenManager.listConnections();

    for (const conn of conns) {
      try {
        const full = await this.tokenManager.getConnection(conn.id);
        if (!full) continue;

        const result = await this.devices.registerProvider(full.providerType, full.config);
        if (result.success) {
          if (!this.connections.some((c) => c.id === full.id)) {
            this.connections.push({ id: full.id, type: full.providerType, name: full.name, email: full.email });
          }
          this.isConnected = true;
        }
      } catch (err) {
        console.warn(`[MomAIHomeConnector] Falha ao restaurar conexão ${conn.id}:`, err.message);
      }
    }

    return this.getStatus();
  }

  async ensureConnected(momai) {
    if (this.isConnected && this.connections.length > 0) {
      return this.getStatus();
    }

    if (momai?.storage) {
      try {
        if (momai.storage.storageDir && this.dbManager) {
          const customDbPath = path.join(momai.storage.storageDir, 'smarthome.sqlite');
          if (this.dbManager.dbPath !== customDbPath) {
            this.dbManager.dbPath = customDbPath;
          }
        }

        const savedConns = await momai.storage.get('connections');
        if (savedConns && typeof savedConns === 'object') {
          const entries = Object.values(savedConns);
          const sanitized = Object.fromEntries(entries.filter((conn) => conn?.id).map((conn) => [conn.id, {
            id: conn.id,
            type: conn.type || 'homeassistant',
            name: conn.name || 'Home Assistant',
            ...(conn.url ? { url: conn.url } : {}),
            email: conn.email || 'local',
            updatedAt: conn.updatedAt || Date.now()
          }]));
          if (Object.keys(sanitized).length > 0) {
            await momai.storage.set('connections', sanitized);
          }
          for (const conn of entries) {
            if (!conn?.url || !conn.token) continue;
            const result = await this.devices.registerProvider(conn.type || 'homeassistant', { url: conn.url, token: conn.token });
            if (result.success) {
              if (!this.connections.some((c) => c.id === conn.id)) {
                this.connections.push({ id: conn.id, type: conn.type || 'homeassistant', name: conn.name || 'Home Assistant', email: conn.email || 'local' });
              }
              await this.tokenManager.saveConnection(conn.id, conn.type || 'homeassistant', { url: conn.url, token: conn.token }, conn.name || 'Home Assistant', conn.email || 'local');
              this.isConnected = true;
            }
          }
        }
      } catch (err) {
        if (momai.log) momai.log(`[MomAIHomeConnector] Erro em momai.storage.get: ${err.message}`);
      }
    }

    if (!this.isConnected) {
      await this.init(momai).catch(() => {});
    }

    return this.getStatus();
  }

  async connectToHomeAssistant(url, token, name, momai) {
    if (!url || !token) throw new Error('URL e token do Home Assistant são obrigatórios');
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
      throw new Error('A URL deve usar HTTP ou HTTPS e não pode conter credenciais');
    }
    if (momai?.storage?.storageDir && this.dbManager) {
      const customDbPath = path.join(momai.storage.storageDir, 'smarthome.sqlite');
      if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
        await this.dbManager.close();
      }
      this.dbManager.dbPath = customDbPath;
    }
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

    if (momai?.storage) {
      try {
        const existing = (await momai.storage.get('connections')) || {};
        existing[connectionId] = {
          id: connectionId,
          type: 'homeassistant',
          name: displayName,
          url,
          email: 'local',
          updatedAt: Date.now()
        };
        await momai.storage.set('connections', existing);
      } catch (err) {
        if (momai.log) momai.log(`[MomAIHomeConnector] Erro ao salvar em momai.storage: ${err.message}`);
      }
    }

    const entities = await this.devices.listDevices('homeassistant');
    await this.tokenManager.cacheEntities(connectionId, entities).catch(() => {});

    if (!this.connections.some((c) => c.id === connectionId)) {
      this.connections.push({ id: connectionId, type: 'homeassistant', name: displayName, email: 'local' });
    }
    this.isConnected = true;

    return { connectionId, ...result };
  }

  async listConnections() {
    return this.tokenManager.listConnections();
  }

  async getLastConnection(momai) {
    if (momai?.storage) {
      try {
        const savedConns = await momai.storage.get('connections');
        if (savedConns && typeof savedConns === 'object') {
          const entries = Object.values(savedConns);
          if (entries.length > 0) {
            const last = entries[entries.length - 1];
            if (last && last.url) {
              return { url: last.url, name: last.name || '' };
            }
          }
        }
      } catch {}
    }

    try {
      const conns = await this.tokenManager.listConnections();
      if (conns && conns.length > 0) {
        const full = await this.tokenManager.getConnection(conns[0].id);
        if (full && full.config) {
          return { url: full.config.url || '', name: full.name || '' };
        }
      }
    } catch {}

    return { url: '', name: '' };
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

  async syncDevices(connectionId) {
    const devices = await this.getDevices(connectionId);
    if (connectionId && devices.length > 0) {
      await this.tokenManager.cacheEntities(connectionId, devices).catch(() => {});
    } else if (this.connections.length > 0 && devices.length > 0) {
      for (const conn of this.connections) {
        await this.tokenManager.cacheEntities(conn.id, devices).catch(() => {});
      }
    }
    return devices;
  }

  async getDeviceState(deviceId, connectionType) {
    return this.devices.getDeviceState(deviceId, connectionType);
  }

  async turnOnDevice(deviceId, connectionType, params = {}) {
    return this.devices.turnOn(deviceId, connectionType, params);
  }

  async turnOffDevice(deviceId, connectionType, params = {}) {
    return this.devices.turnOff(deviceId, connectionType, params);
  }

  async toggleDevice(deviceId, connectionType) {
    return this.devices.toggle(deviceId, connectionType);
  }

  async sendRemoteCommand(deviceId, command, extra = {}, connectionType) {
    return this.devices.sendRemoteCommand(deviceId, command, extra, connectionType);
  }

  async controlMedia(deviceId, action, value, connectionType) {
    return this.devices.controlMedia(deviceId, action, value, connectionType);
  }

  async setClimate(deviceId, temperature, hvacMode, connectionType) {
    return this.devices.setClimate(deviceId, temperature, hvacMode, connectionType);
  }

  async callService(domain, service, data) {
    return this.devices.callService(domain, service, data);
  }

  async removeConnection(connectionId, momai) {
    const conn = this.connections.find((c) => c.id === connectionId);
    if (conn) {
      await this.devices.unregisterProvider(conn.type);
      this.connections = this.connections.filter((c) => c.id !== connectionId);
    }
    if (momai?.storage) {
      try {
        const existing = (await momai.storage.get('connections')) || {};
        delete existing[connectionId];
        await momai.storage.set('connections', existing);
      } catch {}
    }
    await this.tokenManager.removeConnection(connectionId);
    this.isConnected = this.connections.length > 0;
    return { success: true };
  }

  async disconnectAll(momai) {
    await this.devices.disconnectAll();
    if (momai?.storage) {
      try {
        await momai.storage.set('connections', {});
      } catch {}
    }
    const savedConnections = await this.tokenManager.listConnections().catch(() => []);
    for (const connection of savedConnections) {
      await this.tokenManager.removeConnection(connection.id).catch(() => {});
    }
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
