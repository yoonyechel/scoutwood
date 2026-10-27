const http = require('http');
const app = require('../server');

function createTestContext() {
  let server = null;
  let baseUrl = '';

  return {
    async start() {
      return new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve({ server, baseUrl });
        });
      });
    },
    async stop() {
      return new Promise((resolve) => {
        if (server) {
          server.close(() => resolve());
        } else {
          resolve();
        }
      });
    },
    getBaseUrl() {
      return baseUrl;
    }
  };
}

module.exports = {
  createTestContext
};
