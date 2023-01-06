import { NextApiRequest, NextApiResponse } from 'next';
import * as url from 'url';

const HUB_URL_KEY = 'hubURL';
const API_SIZE_ENDPOINT = '/api/size';
const WEBSUB_PING_ENDPOINT = '/api/websub-ping';
const GOOGLE_PING_ENDPOINT = '/api/google-ping';

let storedSizes: { [key: string]: number } = {};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET' && req.query[HUB_URL_KEY]) {
      const hubURL = req.query[HUB_URL_KEY] as string;

      // Check if the hubURL is a valid URL
      const parsedURL = url.parse(hubURL);
      if (!parsedURL.protocol || !parsedURL.host) {
        res.status(400).end('Invalid hubURL provided');
        return;
      }

      // Encode the hubURL value
      const encodedHubURL = encodeURIComponent(hubURL);

      // Make request to custom API to get size of feed
      const apiSizeEndpoint = `${API_SIZE_ENDPOINT}?feed=${encodedHubURL}`;
      const apiRes = await fetch(apiSizeEndpoint);
      const data = await apiRes.json();
      const size = data.size;
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
      const websubPingEndpoint = `${WEBSUB_PING_ENDPOINT}?feed=${encodedHubURL}`;
      const websubPingResponse = await fetch(websubPingEndpoint);
      if (websubPingResponse.status !== 200) {
        console.error(`Error pinging WebSub: ${websubPingResponse.status}`);
        // handle error as needed
      }

      // Ping GooglePing API
      const googlePingEndpoint = `${GOOGLE_PING_ENDPOINT}?sitemap=${encodedHubURL}`;
      const googlePingResponse = await fetch(googlePingEndpoint);
      if (googlePingResponse.status !== 200) {
        console.error(`Error pinging Google: ${googlePingResponse.status}`);
        // handle error as needed
      }

      res.status(200).end('Size has changed and APIs have been pinged');
    } else {
      res.status(400).end('No hubURL provided');
    }
  } catch (error) {
    console.error(error);
    res.status(500).end('An error occurred');
  }
};
