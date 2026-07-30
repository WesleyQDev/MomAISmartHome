const http = require('http');
const url = require('url');
const { exec } = require('child_process');
const { OAuth2Client } = require('google-auth-library');
const { DEFAULT_PORT, DEFAULT_REDIRECT_URI, OAUTH_SCOPES } = require('../config/constants');

class GoogleAuthService {
  constructor(options = {}) {
    this.clientId = options.clientId || process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = options.redirectUri || process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT_URI;
    this.port = parseInt(process.env.PORT || DEFAULT_PORT, 10);

    this.oauth2Client = null;
  }

  getOAuth2Client() {
    if (!this.oauth2Client) {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados no arquivo .env.');
      }
      this.oauth2Client = new OAuth2Client(
        this.clientId,
        this.clientSecret,
        this.redirectUri
      );
    }
    return this.oauth2Client;
  }

  generateAuthUrl() {
    const client = this.getOAuth2Client();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Abre o navegador padrão do sistema no SO do usuário (Windows, macOS ou Linux).
   */
  openBrowser(targetUrl) {
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
      command = `start "" "${targetUrl}"`;
    } else if (platform === 'darwin') {
      command = `open "${targetUrl}"`;
    } else {
      command = `xdg-open "${targetUrl}"`;
    }

    exec(command, (err) => {
      if (err) {
        console.warn(`[GoogleAuth] Não foi possível abrir o navegador automaticamente: ${err.message}`);
        console.log(`Por favor, acesse o link de autenticação manualmente:\n${targetUrl}`);
      }
    });
  }

  /**
   * Inicia um servidor HTTP temporário no IP de loopback (127.0.0.1) para capturar a resposta OAuth 2.0.
   */
  startLoopbackServer() {
    return new Promise((resolve, reject) => {
      let server;

      const timeout = setTimeout(() => {
        if (server) server.close();
        reject(new Error('Tempo limite de autenticação excedido (5 minutos).'));
      }, 5 * 60 * 1000);

      server = http.createServer(async (req, res) => {
        try {
          const reqUrl = url.parse(req.url, true);
          if (reqUrl.pathname === '/callback') {
            const code = reqUrl.query.code;
            const error = reqUrl.query.error;

            if (error) {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(`<h1>Erro na Autenticação</h1><p>${error}</p>`);
              clearTimeout(timeout);
              server.close();
              return reject(new Error(`Autenticação recusada pelo usuário: ${error}`));
            }

            if (!code) {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<h1>Código de autorização não recebido</h1>');
              return;
            }

            // Troca o código de autorização pelos tokens
            const client = this.getOAuth2Client();
            const { tokens } = await client.getToken(code);
            client.setCredentials(tokens);

            // Obtém dados do usuário (e-mail real do Google)
            let email = null;
            try {
              const userInfo = await client.request({
                url: 'https://www.googleapis.com/oauth2/v2/userinfo'
              });
              if (userInfo && userInfo.data && userInfo.data.email) {
                email = userInfo.data.email;
              }
            } catch (userErr) {
              console.error('[GoogleAuth] Falha ao obter e-mail da conta Google:', userErr.message);
              throw new Error(`Falha ao obter perfil do usuário no Google: ${userErr.message}`);
            }

            if (!email) {
              throw new Error('E-mail do usuário não retornado pela API do Google.');
            }

            // Resposta de sucesso amigável com redirecionamento de volta ao MomAI
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <title>MomAI Home Connector - Sucesso</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #141519; color: #e2e2e6; }
                  .card { text-align: center; background-color: #1f2128; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 420px; }
                  h1 { color: #a8c7fa; margin-top: 0; font-size: 1.5rem; }
                  p { color: #9aa0a6; font-size: 0.95rem; line-height: 1.5; }
                  .badge { display: inline-block; background: #34a853; color: #ffffff; padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.85rem; margin-top: 1rem; font-weight: 600; }
                </style>
                <script>
                  setTimeout(function() {
                    window.history.go(-2);
                  }, 1200);
                </script>
              </head>
              <body>
                <div class="card">
                  <h1>Autenticação Concluída!</h1>
                  <p>O ecossistema <strong>MomAI Home Connector</strong> foi conectado com sucesso para o usuário <strong>${email}</strong>.</p>
                  <div class="badge">Retornando ao MomAI...</div>
                </div>
              </body>
              </html>
            `);

            clearTimeout(timeout);
            setImmediate(() => {
              server.close();
            });

            resolve({ tokens, email });
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        } catch (err) {
          clearTimeout(timeout);
          if (server) server.close();
          reject(err);
        }
      });

      server.listen(this.port, '127.0.0.1', () => {
        const authUrl = this.generateAuthUrl();
        this.openBrowser(authUrl);
      });

      server.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`Erro ao iniciar servidor loopback na porta ${this.port}: ${err.message}`));
      });
    });
  }

  /**
   * Atualiza um access token expirado através do refresh token.
   */
  async refreshAccessToken(refreshToken) {
    const client = this.getOAuth2Client();
    client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await client.refreshAccessToken();
    return credentials;
  }

  /**
   * Revoga os tokens no serviço do Google ao realizar logout.
   */
  async revokeToken(token) {
    try {
      const client = this.getOAuth2Client();
      await client.revokeToken(token);
    } catch (err) {
      console.warn('[GoogleAuth] Falha ao revogar token remotamente:', err.message);
    }
  }
}

module.exports = GoogleAuthService;
