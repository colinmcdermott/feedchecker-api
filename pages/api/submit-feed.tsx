import { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import querystring from 'querystring';

const dev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = next({ dev });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = express();

  server.get('/api/submit-feed', (req: NextApiRequest, res: NextApiResponse) => {
    const { feed } = req.query;
    const data = {
      'hub.mode': 'publish',
      'hub.url': feed
    };

    const options = {
      host: 'pubsubhubbub.appspot.com',
      port: 80,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(querystring.stringify(data))
      }
    };

    const req = http.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        console.log(chunk);
      });
      res.on('end', () => {
        console.log('No more data in response.');
        res.send('Success');
      });
    });

    req.on('error', error => {
      console.
