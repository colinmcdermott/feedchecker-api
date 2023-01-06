import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feed } = req.query;
    if (!(feed instanceof URL)) {
      throw new Error('Feed URL must be a valid URL');
    }
    const response = await fetch('https://pubsubhubbub.appspot.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `hub.mode=publish&hub.url=${encodeURIComponent(feed.toString())}`
    });
    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
