import * as http from 'http';

const HUB_URL_KEY = 'hubURL';
const API_SIZE_ENDPOINT = '/api/size';
const WEBSUB_PING_ENDPOINT = '/api/websub-ping';
const GOOGLE_PING_ENDPOINT = '/api/google-ping';

let storedSizes: { [key: string]: number } = {};

// Replace with your own port
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url) {
    const host = req.headers.host;
    const url = new URL(req.url, `http://${host}`);
    const hubURL = url.searchParams.get(HUB_URL_KEY);

    if (!hubURL) {
      res.writeHead(400);
      res.end('No hubURL provided');
      return;
    }

    // Make request to custom API to get size of feed
    const apiSizeEndpoint = `${API_SIZE_ENDPOINT}?feed=${hubURL}`;
    http.get(apiSizeEndpoint, apiRes => {
      let data = '';
      apiRes.on('data', (chunk: string) => {
        data += chunk;
      });
      apiRes.on('end', () => {
        const size = Number(data);
        if (!size) {
          res.writeHead(400);
          res.end('Invalid size received from API');
          return;
        }

        if (storedSizes[hubURL] === size) {
          // Size has not changed, do nothing
          res.writeHead(200);
          res.end('Size has not changed');
          return;
        }

        storedSizes[hubURL] = size;

        // Size has changed, ping WebSub API
        const websubPingEndpoint = `${WEBSUB_PING_ENDPOINT}?feed=${hubURL}`;
        http.get(websubPingEndpoint, () => {
          // Ping GooglePing API
          const googlePingEndpoint = `${GOOGLE_PING_ENDPOINT}?sitemap=${hubURL}`;
          http.get(googlePingEndpoint, () => {
            res.writeHead(200);
            res.end('Size has changed and APIs have been pinged');
          });
        });
      });
    });
  }
});

server.listen(PORT, () => {
  console.log(`Listening on http://${host}:${PORT}`);
});
