const path = require('path');

module.exports = {
  DEFAULT_DB_PATH: path.join(process.cwd(), 'data', 'smarthome.sqlite'),
  DEFAULT_ENCRYPTION_KEY: 'momai_home_connector_secret_32b',

  HA_DEFAULT_URL: 'http://homeassistant.local:8123',

  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16
};
