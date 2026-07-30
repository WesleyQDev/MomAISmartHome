const path = require('path');

module.exports = {
  DEFAULT_PORT: 3333,
  DEFAULT_HOST: '127.0.0.1',
  DEFAULT_REDIRECT_URI: 'http://127.0.0.1:3333/callback',
  DEFAULT_CLIENT_ID: '88176459058-s0su2v4n5krnim0fm8s3j1boti6qogaa.apps.googleusercontent.com',
  DEFAULT_DB_PATH: path.join(process.cwd(), 'data', 'smarthome.sqlite'),
  DEFAULT_ENCRYPTION_KEY: 'momai_home_connector_secret_32b',
  
  OAUTH_SCOPES: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/homegraph',
    'https://www.googleapis.com/auth/sdm.service'
  ],
  
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16
};
