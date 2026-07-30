const crypto = require('crypto');
const { ENCRYPTION_ALGORITHM, IV_LENGTH, DEFAULT_ENCRYPTION_KEY } = require('../config/constants');

class TokenManager {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.encryptionSecret = process.env.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;
  }

  _getKey() {
    return crypto.createHash('sha256').update(String(this.encryptionSecret)).digest();
  }

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

  async saveConnection(id, providerType, config, name, email) {
    await this.dbManager.init();
    const encryptedObject = this.encrypt(config);
    const encryptedJson = JSON.stringify(encryptedObject);

    const sql = `
      INSERT INTO connections (id, provider_type, name, config_encrypted, user_email, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        provider_type = excluded.provider_type,
        name = excluded.name,
        config_encrypted = excluded.config_encrypted,
        user_email = excluded.user_email,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await this.dbManager.run(sql, [id, providerType, name, encryptedJson, email]);
  }

  async getConnection(id) {
    await this.dbManager.init();
    const row = await this.dbManager.get(`SELECT * FROM connections WHERE id = ?`, [id]);

    if (!row) return null;

    try {
      const encryptedPayload = JSON.parse(row.config_encrypted);
      const config = this.decrypt(encryptedPayload);
      return {
        id: row.id,
        providerType: row.provider_type,
        name: row.name,
        email: row.user_email,
        config,
        updatedAt: row.updated_at
      };
    } catch (err) {
      console.error('[TokenManager] Erro ao descriptografar config da conexão:', err.message);
      return null;
    }
  }

  async listConnections() {
    await this.dbManager.init();
    return this.dbManager.all(`SELECT id, provider_type, name, user_email, updated_at FROM connections ORDER BY updated_at DESC`);
  }

  async removeConnection(id) {
    await this.dbManager.init();
    await this.dbManager.run(`DELETE FROM connections WHERE id = ?`, [id]);
    await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [id]);
    await this.dbManager.run(`DELETE FROM rooms WHERE connection_id = ?`, [id]);
  }

  async cacheEntities(connectionId, entities) {
    await this.dbManager.init();
    await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [connectionId]);

    for (const e of entities) {
      await this.dbManager.run(
        `INSERT INTO cached_entities (entity_id, connection_id, name, domain, type_name, room, state_json, attributes_json, online, last_seen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          e.id,
          connectionId,
          e.name,
          e.domain || '',
          e.type || '',
          e.room || '',
          JSON.stringify(e.state || {}),
          JSON.stringify(e.attributes || {}),
          e.online ? 1 : 0
        ]
      );
    }
  }

  async getCachedEntities(connectionId) {
    await this.dbManager.init();
    const rows = await this.dbManager.all(
      `SELECT * FROM cached_entities WHERE connection_id = ? ORDER BY room, name`,
      [connectionId]
    );
    return rows.map((r) => ({
      id: r.entity_id,
      name: r.name,
      domain: r.domain,
      type: r.type_name,
      room: r.room,
      state: JSON.parse(r.state_json || '{}'),
      attributes: JSON.parse(r.attributes_json || '{}'),
      online: Boolean(r.online)
    }));
  }
}

module.exports = TokenManager;
