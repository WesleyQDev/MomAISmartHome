const path = require('path');

// Carrega variáveis de ambiente do arquivo .env se existir
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // dotenv opcional se variáveis de ambiente já estiverem injetadas
}

const DatabaseManager = require('./database/database');
const TokenManager = require('./auth/tokenManager');
const GoogleAuthService = require('./auth/googleAuth');
const DeviceManager = require('./integrations/deviceManager');

class MomAIHomeConnector {
  constructor(options = {}) {
    this.dbManager = new DatabaseManager(options.dbPath);
    this.tokenManager = new TokenManager(this.dbManager);
    this.authService = new GoogleAuthService(options.authOptions);
    this.devices = new DeviceManager();

    this.userEmail = null;
    this.isConnected = false;
    this.accessToken = null;
  }

  /**
   * Inicializa o banco de dados e verifica se existe uma sessão salva.
   */
  async init() {
    await this.dbManager.init();
    const session = await this.tokenManager.getSession();

    if (session && session.tokens) {
      this.userEmail = session.email;
      this.accessToken = session.tokens.access_token;

      // Verifica se o access_token precisa de refresh
      if (session.tokens.expiry_date && Date.now() >= session.tokens.expiry_date - 60000) {
        if (session.tokens.refresh_token) {
          try {
            const newTokens = await this.authService.refreshAccessToken(session.tokens.refresh_token);
            const updatedTokens = { ...session.tokens, ...newTokens };
            await this.tokenManager.saveSession({ email: session.email, tokens: updatedTokens });
            this.accessToken = updatedTokens.access_token;
            this.isConnected = true;
          } catch (err) {
            console.warn('[MomAIHomeConnector] Erro ao renovar token de acesso:', err.message);
            this.isConnected = false;
          }
        } else {
          this.isConnected = false;
        }
      } else {
        this.isConnected = true;
      }
    } else {
      this.isConnected = false;
      this.userEmail = null;
      this.accessToken = null;
    }

    if (this.isConnected) {
      await this.devices.connect(this.accessToken);
    }

    return this.getStatus();
  }

  /**
   * Inicia o fluxo de login Google OAuth 2.0 via Loopback HTTP local.
   */
  async login() {
    await this.dbManager.init();
    const { tokens, email } = await this.authService.startLoopbackServer();
    
    await this.tokenManager.saveSession({ email, tokens });
    this.userEmail = email;
    this.accessToken = tokens.access_token;
    this.isConnected = true;

    await this.devices.connect(this.accessToken);

    return this.getStatus();
  }

  /**
   * Busca a lista de dispositivos reais autenticados no Google.
   */
  async getDevices() {
    if (!this.isConnected || !this.accessToken) {
      return [];
    }
    return this.devices.listDevices(this.accessToken);
  }

  /**
   * Liga um dispositivo real via Google API.
   */
  async turnOnDevice(deviceId) {
    return this.devices.turnOn(deviceId, this.accessToken);
  }

  /**
   * Desliga um dispositivo real via Google API.
   */
  async turnOffDevice(deviceId) {
    return this.devices.turnOff(deviceId, this.accessToken);
  }

  /**
   * Encerra a sessão ativa, revoga tokens e limpa o banco de dados local.
   */
  async logout() {
    const session = await this.tokenManager.getSession();
    if (session && session.tokens) {
      const tokenToRevoke = session.tokens.access_token || session.tokens.refresh_token;
      if (tokenToRevoke) {
        await this.authService.revokeToken(tokenToRevoke);
      }
    }

    await this.tokenManager.clearSession();
    this.isConnected = false;
    this.userEmail = null;
    this.accessToken = null;

    return {
      success: true,
      message: 'Sessão encerrada com sucesso.'
    };
  }

  /**
   * Retorna o status atual da conexão e e-mail do usuário autenticado.
   */
  getStatus() {
    return {
      connected: this.isConnected,
      email: this.userEmail,
      status: this.isConnected ? 'AUTHENTICATED' : 'DISCONNECTED'
    };
  }
}

// Exporta tanto a Classe quanto uma instância Singleton padrão
const defaultInstance = new MomAIHomeConnector();
defaultInstance.MomAIHomeConnector = MomAIHomeConnector;

module.exports = defaultInstance;
