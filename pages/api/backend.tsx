import { NextApiRequest, NextApiResponse } from 'next';
import * as http from 'http';

const HUB_URL_KEY = 'hubURL';
const API_SIZE_ENDPOINT = '/api/size';
const WEBSUB_PING_ENDPOINT = '/api/websub-ping';
const GOOGLE_PING_ENDPOINT = '/api/google-ping';

let storedSizes: { [key: string]: number } = {};

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET' && req.query[HUB_URL_KEY]) {
    const hubURL = req.query[HUB_URL_KEY] as string;

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
          res.status(400).end('Invalid size received from API');
          return;
        }

        if (storedSizes[hubURL] === size) {
          // Size has not changed, do nothing
          res.status(200).end('Size has not changed');
          return;
        }

        storedSizes[hubURL] = size;

        // Size has changed, ping WebSub API
        const websubPingEndpoint = `${WEBSUB_PING_ENDPOINT}?feed=${hubURL}`;
        http.get(websubPingEndpoint, () => {
          // Ping GooglePing API
          const googlePingEndpoint = `${GOOGLE_PING_ENDPOINT}?sitemap=${hubURL}`;
          http.get(googlePingEndpoint, () => {
            res.status(200).end('Size has changed and APIs have been pinged');
          });
        });
      });
    });
  } else {
    res.status(400).end('No hubURL provided');
  }
};
