const BetterSqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { DEFAULT_DB_PATH } = require('../config/constants.ts');

class DatabaseManager {
  dbPath: string = process.env.DB_PATH || DEFAULT_DB_PATH
  db: any = null

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

    try {
      this.db = new BetterSqlite3(this.dbPath);
      await this._createTables();
      return this;
    } catch (err) {
      this.db = null;
      throw new Error(`Falha ao conectar ao banco de dados SQLite: ${err.message}`);
    }
  }

  async _createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        provider_type TEXT NOT NULL,
        name TEXT,
        config_encrypted TEXT NOT NULL,
        user_email TEXT,
        auto_connect INTEGER NOT NULL DEFAULT 1,
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

    const columns = await this.all(`PRAGMA table_info(connections)`);
    if (!columns.some((column) => column.name === 'auto_connect')) {
      await this.run(`ALTER TABLE connections ADD COLUMN auto_connect INTEGER NOT NULL DEFAULT 1`);
    }
  }

  run(sql, params = []) {
    const result = this.db.prepare(sql).run(...params);
    return Promise.resolve({ lastID: Number(result.lastInsertRowid), changes: result.changes });
  }

  get(sql, params = []) {
    return Promise.resolve(this.db.prepare(sql).get(...params));
  }

  all(sql, params = []) {
    return Promise.resolve(this.db.prepare(sql).all(...params));
  }

  close() {
    if (!this.db) return Promise.resolve();
    this.db.close();
    this.db = null;
    return Promise.resolve();
  }
}

module.exports = DatabaseManager;
