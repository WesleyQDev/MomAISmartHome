const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ENCRYPTION_ALGORITHM, IV_LENGTH, ENCRYPTION_KEY_PATH } = require('../config/constants');

const LEGACY_ENCRYPTION_KEY = 'momai_home_connector_secret_32b';

class TokenManager {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.encryptionSecret = process.env.ENCRYPTION_KEY || this._loadOrCreateKey();
  }

  _loadOrCreateKey(customDir) {
    const candidatePaths = [
      customDir ? path.join(customDir, '.encryption-key') : null,
      ENCRYPTION_KEY_PATH,
      path.join(require('../config/constants').DEFAULT_DB_PATH, '..', '.encryption-key'),
      path.join(__dirname, '..', '..', 'data', '.encryption-key')
    ].filter(Boolean);

    for (const keyPath of candidatePaths) {
      try {
        if (fs.existsSync(keyPath)) {
          const existing = fs.readFileSync(keyPath, 'utf8').trim();
          if (existing) return existing;
        }
      } catch {}
    }

    const keyPath = candidatePaths[0];
    const key = crypto.randomBytes(32).toString('hex');
    try {
      fs.mkdirSync(path.dirname(keyPath), { recursive: true });
      fs.writeFileSync(keyPath, key, { encoding: 'utf8', mode: 0o600 });
    } catch {}
    return key;
  }

  reloadKey(customDir) {
    if (process.env.ENCRYPTION_KEY) {
      this.encryptionSecret = process.env.ENCRYPTION_KEY;
    } else {
      this.encryptionSecret = this._loadOrCreateKey(customDir);
    }
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

  decrypt(encryptedPayload, secret = this.encryptionSecret) {
    const key = crypto.createHash('sha256').update(String(secret)).digest();
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

    try {
      const dbDir = path.dirname(this.dbManager.dbPath);
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      const credsPath = path.join(dbDir, 'last_credentials.json');
      fs.writeFileSync(credsPath, JSON.stringify({ url: config.url || '', token: config.token || '', name: name || '' }), 'utf8');
    } catch {}
  }

  async getLastCredentials() {
    try {
      const dbDir = path.dirname(this.dbManager.dbPath);
      const credsPath = path.join(dbDir, 'last_credentials.json');
      if (fs.existsSync(credsPath)) {
        const content = fs.readFileSync(credsPath, 'utf8');
        return JSON.parse(content);
      }
    } catch {}
    return null;
  }

  async getConnection(id) {
    await this.dbManager.init();
    const row = await this.dbManager.get(`SELECT * FROM connections WHERE id = ?`, [id]);

    if (!row) return null;

    let config = null;
    let migrated = false;
    try {
      const encryptedPayload = JSON.parse(row.config_encrypted);
      if (encryptedPayload && encryptedPayload.encryptedData && encryptedPayload.iv && encryptedPayload.authTag) {
        try {
          config = this.decrypt(encryptedPayload);
        } catch {
          const candidateKeys = [
            ENCRYPTION_KEY_PATH,
            path.join(require('../config/constants').DEFAULT_DB_PATH, '..', '.encryption-key'),
            path.join(__dirname, '..', '..', 'data', '.encryption-key')
          ];
          for (const kPath of candidateKeys) {
            try {
              if (fs.existsSync(kPath)) {
                const fileKey = fs.readFileSync(kPath, 'utf8').trim();
                if (fileKey) {
                  config = this.decrypt(encryptedPayload, fileKey);
                  migrated = true;
                  break;
                }
              }
            } catch {}
          }
          if (!config) {
            try {
              config = this.decrypt(encryptedPayload, LEGACY_ENCRYPTION_KEY);
              migrated = true;
            } catch {}
          }
        }
      } else if (encryptedPayload && typeof encryptedPayload === 'object' && (encryptedPayload.url || encryptedPayload.token)) {
        config = encryptedPayload;
        migrated = true;
      }
    } catch {
      try {
        if (typeof row.config_encrypted === 'string' && (row.config_encrypted.includes('http') || row.config_encrypted.includes('token'))) {
          config = JSON.parse(row.config_encrypted);
          migrated = true;
        }
      } catch {}
    }

    if (!config) {
      const lastCreds = await this.getLastCredentials();
      if (lastCreds && lastCreds.url && lastCreds.token) {
        config = { url: lastCreds.url, token: lastCreds.token };
        migrated = true;
      } else {
        console.error('[TokenManager] Erro ao descriptografar config da conexão', id);
        return null;
      }
    }

    if (migrated) {
      try {
        await this.dbManager.run(
          `UPDATE connections SET config_encrypted = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [JSON.stringify(this.encrypt(config)), id]
        );
      } catch {}
    }

    return {
      id: row.id,
      providerType: row.provider_type,
      name: row.name,
      email: row.user_email,
      config,
      updatedAt: row.updated_at
    };
  }

  async listConnections() {
    await this.dbManager.init();
    const rows = await this.dbManager.all(`SELECT id, provider_type, name, user_email, updated_at FROM connections ORDER BY updated_at DESC`);
    if (rows && rows.length > 0) return rows;

    const lastCreds = await this.getLastCredentials();
    if (lastCreds && lastCreds.url) {
      return [{
        id: 'ha_last_creds',
        provider_type: 'homeassistant',
        name: lastCreds.name || 'Home Assistant',
        user_email: 'local',
        updated_at: new Date().toISOString()
      }];
    }
    return [];
  }

  async removeConnection(id) {
    await this.dbManager.init();
    await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [id]);
    await this.dbManager.run(`DELETE FROM rooms WHERE connection_id = ?`, [id]);
    await this.dbManager.run(`DELETE FROM connections WHERE id = ?`, [id]);
  }

  async cacheEntities(connectionId, entities) {
    await this.dbManager.init();
    await this.dbManager.run(`DELETE FROM cached_entities WHERE connection_id = ?`, [connectionId]);

    for (const e of entities) {
      await this.dbManager.run(
        `INSERT OR REPLACE INTO cached_entities (entity_id, connection_id, name, domain, type_name, room, state_json, attributes_json, online, last_seen)
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
