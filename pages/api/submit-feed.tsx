import { NextApiRequest, NextApiResponse } from 'next';
import request from 'request';
import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/api/submit-feed', (req: NextApiRequest, res: NextApiResponse) => {
    const { feed } = req.query;
    const data = {
      'hub.mode': 'publish',
      'hub.url': feed
    };

    request.post({
      url: 'https://pubsubhubbub.appspot.com/',
      form: data
    }, (error, response, body) => {
      if (error) {
        console.error(error);
        return res.send('Error');
      }
      console.log(body);
      res.send('Success');
    });
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, err => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
