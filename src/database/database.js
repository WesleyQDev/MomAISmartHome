const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { DEFAULT_DB_PATH } = require('../config/constants');

class DatabaseManager {
  constructor(dbPath = process.env.DB_PATH || DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async init() {
    if (this.db) return this;

    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          return reject(new Error(`Falha ao conectar ao banco de dados SQLite: ${err.message}`));
        }
        this._createTables()
          .then(() => resolve(this))
          .catch(reject);
      });
    });
  }

  async _createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        provider_type TEXT NOT NULL,
        name TEXT,
        config_encrypted TEXT NOT NULL,
        user_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS cached_entities (
        entity_id TEXT PRIMARY KEY,
        connection_id TEXT NOT NULL,
        name TEXT,
        domain TEXT,
        type_name TEXT,
        room TEXT,
        state_json TEXT,
        attributes_json TEXT,
        online INTEGER DEFAULT 1,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES connections(id)
      )`,
      `CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        connection_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'room',
        FOREIGN KEY (connection_id) REFERENCES connections(id)
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        encrypted_tokens TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err) => {
        if (err) return reject(err);
        this.db = null;
        resolve();
      });
    });
  }
}

module.exports = DatabaseManager;
