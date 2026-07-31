const path = require('path');

const dataDir = process.env.MOMAI_NODE_CORE_DATA_DIR || process.env.MOMAI_DATA_DIR || path.join(__dirname, '..', '..', 'data');

module.exports = {
  DEFAULT_DB_PATH: process.env.DB_PATH || path.join(dataDir, 'smarthome.sqlite'),
  DEFAULT_ENCRYPTION_KEY: 'momai_home_connector_secret_32b',

  HA_DEFAULT_URL: 'http://homeassistant.local:8123',

  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16
};
