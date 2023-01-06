import fetch from 'isomorphic-unfetch';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { hubURL } = req.query;
    const response = await fetch('https://pubsubhubbub.appspot.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `hub.mode=publish&hub.url=${hubURL}`,
    });
    const data = await response.json();
    res.json(data);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
