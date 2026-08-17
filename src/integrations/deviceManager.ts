const { EventEmitter } = require('events');
const HomeAssistantProvider = require('./providers/homeAssistant.ts');

const PROVIDER_REGISTRY = {
  homeassistant: HomeAssistantProvider
};

class DeviceManager extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this._lastErrorLogged = new Map();
    this._lastConnectFail = new Map(); // tipo -> ts da última falha de conexão
    this._registerQueue = Promise.resolve();
  }

  async registerProvider(type, config = {}) {
    // Serializa chamadas concorrentes: sem isso, duas registerProvider do
    // mesmo tipo rodavam em paralelo, e a segunda sobrescrevia providers.set
    // sem desconectar o primeiro — o connect() da primeira continuava e
    // deixava um WebSocket órfão (M2).
    const run = this._registerQueue.then(
      () => this._registerProvider(type, config),
      () => this._registerProvider(type, config)
    );
    this._registerQueue = run.then(() => {}, () => {});
    return run;
  }

  async _registerProvider(type, config = {}) {
    const ProviderClass = PROVIDER_REGISTRY[type];
    if (!ProviderClass) {
      throw new Error(`Provider desconhecido: ${type}. Disponíveis: ${Object.keys(PROVIDER_REGISTRY).join(', ')}`);
    }

    // Cooldown por tipo (sobrevive à recriação do provider): quando o Home
    // Assistant está offline, cada tentativa de rede pode custar até ~8s de
    // timeout (REQUEST_TIMEOUT_MS no provider). Como o init recria o provider
    // a cada comando, o cooldown por-instância nunca funcionava e a UI ficava
    // "carregando" por vários segundos. Agora, após uma falha, os comandos
    // seguintes retornam "indisponível" na hora, e a rede só é tentada de novo
    // a cada 15s.
    const lastFail = this._lastConnectFail.get(type) || 0;
    if (lastFail && Date.now() - lastFail < 15000) {
      const err = new Error(
        'Home Assistant indisponível (tentativa anterior falhou). Verifique se o servidor está ligado e acessível na rede.'
      );
      err.code = 'ha_cooldown';
      throw err;
    }

    if (this.providers.has(type)) {
      await this.providers.get(type).disconnect();
    }

    const provider = new ProviderClass(config);

    if (typeof provider.on === 'function') {
      provider.on('state_changed', (data) => {
        this.emit('state_changed', data);
      });
      provider.on('connection_changed', (data) => {
        this.emit('connection_changed', data);
      });
    }

    this.providers.set(type, provider);
    let result;
    try {
      result = await provider.connect();
    } catch (err) {
      this._lastConnectFail.set(type, Date.now());
      // Guard de log: quando o Home Assistant está inacessível, o runtime tenta
      // reconectar a cada poucos segundos. Logar a cada tentativa inundava o
      // main.log do MomAI — só loga na primeira falha (ou a cada 60s).
      const last = this._lastErrorLogged.get(type) || 0;
      if (Date.now() - last > 60000) {
        console.warn(`[DeviceManager] Connect offline/error for ${type}:`, err.message);
        this._lastErrorLogged.set(type, Date.now());
      }
      result = { success: false, error: err.message, code: err.code || 'ha_error' };
    }
    return result;
  }

  async unregisterProvider(type) {
    const provider = this.providers.get(type);
    if (provider) {
      await provider.disconnect();
      this.providers.delete(type);
    }
    return { success: true };
  }

  async listDevices(providerType) {
    if (providerType) {
      const provider = this.providers.get(providerType);
      if (!provider) return [];
      return provider.listDevices();
    }

    const allDevices = [];
    for (const provider of this.providers.values()) {
      try {
        const devices = await provider.listDevices();
        allDevices.push(...devices);
      } catch (err) {
        console.warn(`[DeviceManager] Erro ao listar devices de ${provider.name}:`, err.message);
      }
    }
    return allDevices;
  }

  async getDeviceState(deviceId, providerType) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider || typeof provider.getDeviceState !== 'function') return null;
    return provider.getDeviceState(deviceId);
  }

  async turnOn(deviceId, providerType, params = {}) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider) return { success: false, error: 'Nenhum provider disponível para este dispositivo' };
    return provider.turnOn(deviceId, params);
  }

  async turnOff(deviceId, providerType, params = {}) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider) return { success: false, error: 'Nenhum provider disponível para este dispositivo' };
    return provider.turnOff(deviceId, params);
  }

  async toggle(deviceId, providerType) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider || typeof provider.toggle !== 'function') {
      return { success: false, error: 'Provider não suporta alternância para este dispositivo' };
    }
    return provider.toggle(deviceId);
  }

  async sendRemoteCommand(deviceId, command, extra = {}, providerType) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider) return { success: false, error: 'Nenhum provider disponível para este dispositivo' };
    if (typeof provider.sendRemoteCommand === 'function') {
      return provider.sendRemoteCommand(deviceId, command, extra);
    }
    return { success: false, error: 'Provider não suporta comandos de controle remoto' };
  }

  async controlMedia(deviceId, action, value, providerType) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider) return { success: false, error: 'Nenhum provider disponível para este dispositivo' };
    if (typeof provider.controlMedia === 'function') {
      return provider.controlMedia(deviceId, action, value);
    }
    return { success: false, error: 'Provider não suporta controle de mídia' };
  }

  async setClimate(deviceId, temperature, hvacMode, providerType) {
    const provider = this._resolveProvider(deviceId, providerType);
    if (!provider) return { success: false, error: 'Nenhum provider disponível para este dispositivo' };
    if (typeof provider.setClimate === 'function') {
      return provider.setClimate(deviceId, temperature, hvacMode);
    }
    return { success: false, error: 'Provider não suporta controle de climatização' };
  }

  async callService(domain, service, data = {}, providerType) {
    if (providerType) {
      const provider = this.providers.get(providerType);
      if (!provider) throw new Error(`Provider ${providerType} não encontrado`);
      return provider.callService(domain, service, data);
    }

    for (const provider of this.providers.values()) {
      if (typeof provider.callService === 'function') {
        try {
          return await provider.callService(domain, service, data);
        } catch {}
      }
    }
    throw new Error('Nenhum provider respondeu ao serviço');
  }

  getStatus() {
    const statuses = {};
    let anyConnected = false;
    let lastError = null;
    for (const [type, provider] of this.providers.entries()) {
      statuses[type] = { connected: provider.connected, name: provider.name, error: provider.lastError || null };
      if (provider.connected) anyConnected = true;
      if (provider.lastError) lastError = provider.lastError;
    }
    return {
      providers: statuses,
      connected: anyConnected,
      lastError
    };
  }

  async disconnectAll() {
    for (const [type, provider] of this.providers.entries()) {
      await provider.disconnect();
    }
    this.providers.clear();
  }

  _resolveProvider(deviceId, providerType) {
    if (providerType) return this.providers.get(providerType);

    for (const provider of this.providers.values()) {
      if (provider.cachedDevices?.has(deviceId)) return provider;
    }

    return this.providers.values().next().value || null;
  }
}

DeviceManager.PROVIDER_REGISTRY = PROVIDER_REGISTRY;

module.exports = DeviceManager;
