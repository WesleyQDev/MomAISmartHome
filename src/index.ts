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
      this.devices.on('connection_changed', (data) => {
        this.isConnected = Boolean(data?.connected);
        this.emit('connection_changed', data);
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
      if (this.tokenManager && typeof this.tokenManager.reloadKey === 'function') {
        this.tokenManager.reloadKey(momai.storage.storageDir);
      }
    }
    await this.dbManager.init();
    const conns = await this.tokenManager.listConnections();

    for (const conn of conns) {
      try {
        const full = await this.tokenManager.getConnection(conn.id);
        if (!full || !full.config) continue;

        if (!this.connections.some((c) => c.id === full.id)) {
          this.connections.push({ id: full.id, type: full.providerType, name: full.name, email: full.email });
        }

        try {
          const regRes = await this.devices.registerProvider(full.providerType, full.config);
          if (regRes && regRes.success !== false) {
            this.isConnected = true;
          } else {
            console.warn(`[MomAIHomeConnector] Provider ${conn.id} offline/falha na conexão:`, regRes?.error);
          }
        } catch (regErr) {
          console.warn(`[MomAIHomeConnector] Erro ao registrar provider para ${conn.id}:`, regErr.message);
        }
      } catch (err) {
        console.warn(`[MomAIHomeConnector] Falha ao restaurar conexão ${conn.id}:`, err.message);
      }
    }

    return this.getStatus();
  }

  async ensureConnected(momai) {
    const status = this.devices.getStatus();
    if (this.isConnected && this.connections.length > 0 && status.connected) {
      return this.getStatus();
    }

    await this.init(momai).catch(() => {});

    return this.getStatus();
  }

  async connectToHomeAssistant(url, token, name, momai) {
    if (!url || !token) throw new Error('URL e token do Home Assistant são obrigatórios');
    url = String(url).trim().replace(/\/+$/, '');
    token = String(token).trim();
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
      if (this.tokenManager && typeof this.tokenManager.reloadKey === 'function') {
        this.tokenManager.reloadKey(momai.storage.storageDir);
      }
    }
    await this.dbManager.init();
    const displayName = name || 'Home Assistant';

    // Desconecta e remove conexões antigas do mesmo tipo para manter apenas a conexão ativa
    await this.disconnectAll(momai).catch(() => {});

    this.auth.setCredentials(url, token);

    const connectionId = 'ha_' + Date.now();
    const result = await this.devices.registerProvider('homeassistant', { url, token });

    if (!result || result.success === false) {
      const code = result?.code;
      const urlMsg = url ? ` em ${url}` : '';
      if (code === 'ha_auth') {
        throw new Error(
          'Token do Home Assistant inválido ou expirado (HTTP 401). ' +
          'Gere um novo Long-Lived Access Token em: Perfil do usuário → Segurança → Tokens de Acesso de Longa Duração, ' +
          'e confira se a URL (ex.: http://192.168.1.10:8123) está correta.'
        );
      }
      if (code === 'ha_timeout') {
        throw new Error(`O servidor Home Assistant${urlMsg} demorou demais para responder. Verifique se ele está ligado e acessível na rede.`);
      }
      if (code === 'ha_network') {
        throw new Error(`Não foi possível acessar o servidor${urlMsg} (conexão recusada ou offline). Verifique se o Home Assistant está ligado, se a URL/IP está correto e se está na mesma rede.`);
      }
      throw new Error(`Falha ao conectar ao Home Assistant: ${result?.error || ''}`);
    }

    await this.tokenManager.saveConnection(
      connectionId,
      'homeassistant',
      { url, token },
      displayName,
      'local'
    );

    this.lastCredentials = { url, token, name: displayName };

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
    if (momai?.storage?.storageDir && this.dbManager) {
      const customDbPath = path.join(momai.storage.storageDir, 'smarthome.sqlite');
      if (this.dbManager.db && this.dbManager.dbPath !== customDbPath) {
        await this.dbManager.close();
      }
      if (this.dbManager.dbPath !== customDbPath) {
        this.dbManager.dbPath = customDbPath;
      }
      if (this.tokenManager && typeof this.tokenManager.reloadKey === 'function') {
        this.tokenManager.reloadKey(momai.storage.storageDir);
      }
    }

    try {
      const savedConnection = await this.tokenManager.getLastConnection();
      if (savedConnection?.config) {
        return { url: savedConnection.config.url || '', token: savedConnection.config.token || '', name: savedConnection.name || '' };
      }
    } catch {}

    if (momai?.storage) {
      try {
        const savedConns = await momai.storage.get('connections');
        if (savedConns && typeof savedConns === 'object') {
          const entries = Object.values(savedConns);
          if (entries.length > 0) {
            const last = entries[entries.length - 1];
            if (last && last.url) {
              return { url: last.url, token: last.token || '', name: last.name || '' };
            }
          }
        }
      } catch {}
    }

    if (this.lastCredentials && (this.lastCredentials.url || this.lastCredentials.token)) {
      return { url: this.lastCredentials.url || '', token: this.lastCredentials.token || '', name: this.lastCredentials.name || '' };
    }

    try {
      const savedTokenCreds = await this.tokenManager.getLastCredentials();
      if (savedTokenCreds && (savedTokenCreds.url || savedTokenCreds.token)) {
        return { url: savedTokenCreds.url || '', token: savedTokenCreds.token || '', name: savedTokenCreds.name || '' };
      }
    } catch {}

    return { url: '', token: '', name: '' };
  }

  async getDevices(connectionId) {
    const status = this.devices.getStatus();
    if (Object.keys(status.providers).length === 0) {
      try {
        const conns = await this.tokenManager.listConnections();
        if (conns.length > 0) {
          const cached = await this.tokenManager.getCachedEntities(connectionId || conns[0].id);
          if (cached && cached.length > 0) return cached;
        }
      } catch {}
      return [];
    }

    if (connectionId) {
      const conn = this.connections.find((c) => c.id === connectionId);
      if (conn) return this.devices.listDevices(conn.type);
      return [];
    }

    const devices = await this.devices.listDevices();
    if ((!devices || devices.length === 0)) {
      try {
        const conns = await this.tokenManager.listConnections();
        for (const c of conns) {
          const cached = await this.tokenManager.getCachedEntities(c.id);
          if (cached && cached.length > 0) return cached;
        }
      } catch {}
    }
    return devices;
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
      try {
        await momai.storage.set('last_credentials', null);
      } catch {}
    }
    await this.tokenManager.deactivateAllConnections().catch(() => {});
    await this.tokenManager.clearLastCredentials().catch(() => {});
    this.connections = [];
    this.lastCredentials = null;
    this.auth.setCredentials('', '');
    this.isConnected = false;
    return { success: true, message: 'Todas as conexões encerradas.' };
  }

  getStatus() {
    const providerStatus = this.devices.getStatus();
    const haProvider = providerStatus?.providers?.homeassistant;
    const isProviderConnected = Boolean(providerStatus?.connected || haProvider?.connected);
    return {
      connected: this.isConnected && isProviderConnected,
      connections: this.connections.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name
      })),
      providerStatus,
      lastError: providerStatus?.lastError || null
    };
  }
}

const defaultInstance = new MomAIHomeConnector();
defaultInstance.MomAIHomeConnector = MomAIHomeConnector;

module.exports = defaultInstance;
