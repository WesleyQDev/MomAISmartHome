const crypto = require('crypto');
const { ENCRYPTION_ALGORITHM, IV_LENGTH, DEFAULT_ENCRYPTION_KEY } = require('../config/constants');

class TokenManager {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.encryptionSecret = process.env.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;
  }

  /**
   * Deriva uma chave de 32 bytes segura a partir do secret do usuário.
   */
  _getKey() {
    return crypto.createHash('sha256').update(String(this.encryptionSecret)).digest();
  }

  /**
   * Criptografa dados em formato JSON usando AES-256-GCM.
   */
  encrypt(data) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this._getKey();
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    const jsonString = JSON.stringify(data);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag
    };
  }

  /**
   * Descriptografa um objeto contendo { iv, encryptedData, authTag }.
   */
  decrypt(encryptedPayload) {
    const key = this._getKey();
    const iv = Buffer.from(encryptedPayload.iv, 'hex');
    const authTag = Buffer.from(encryptedPayload.authTag, 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Salva ou atualiza a sessão ativa no banco de dados SQLite.
   */
  async saveSession({ email, tokens }) {
    await this.dbManager.init();
    const encryptedObject = this.encrypt(tokens);
    const encryptedJson = JSON.stringify(encryptedObject);

    const sql = `
      INSERT INTO sessions (id, user_email, encrypted_tokens, updated_at)
      VALUES ('active_session', ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        user_email = excluded.user_email,
        encrypted_tokens = excluded.encrypted_tokens,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await this.dbManager.run(sql, [email, encryptedJson]);
  }

  /**
   * Recupera a sessão ativa descriptografada.
   */
  async getSession() {
    await this.dbManager.init();
    const row = await this.dbManager.get(`SELECT * FROM sessions WHERE id = 'active_session'`);

    if (!row) return null;

    try {
      const encryptedPayload = JSON.parse(row.encrypted_tokens);
      const tokens = this.decrypt(encryptedPayload);
      return {
        email: row.user_email,
        tokens,
        updatedAt: row.updated_at
      };
    } catch (err) {
      console.error('[TokenManager] Erro ao descriptografar tokens de sessão:', err.message);
      return null;
    }
  }

  /**
   * Remove a sessão local (logout).
   */
  async clearSession() {
    await this.dbManager.init();
    await this.dbManager.run(`DELETE FROM sessions WHERE id = 'active_session'`);
  }
}

module.exports = TokenManager;
