const path = require('path');

const dataDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, '..', '..', 'data');
module.exports = {
  get DEFAULT_DB_PATH() {
    const dDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, '..', '..', 'data');
    return process.env.DB_PATH || path.join(dDir, 'smarthome.sqlite');
  },
  get ENCRYPTION_KEY_PATH() {
    const dDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, '..', '..', 'data');
    return process.env.ENCRYPTION_KEY_PATH || path.join(dDir, '.encryption-key');
  },

  HA_DEFAULT_URL: 'http://homeassistant.local:8123',

  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16
};
