import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feed } = req.query;
    if (typeof feed !== 'string') {
      throw new Error('Feed URL must be a valid URL');
    }
    const decodedFeed = decodeURIComponent(feed);
    const feedUrl = new URL(decodedFeed);
    if (!(feedUrl instanceof URL)) {
      throw new Error('Feed URL must be a valid URL');
    }
    const response = await fetch('https://pubsubhubbub.appspot.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `hub.mode=publish&hub.url=${encodeURIComponent(feedUrl.toString())}`
    });
    if (!response.ok) {
      throw new Error('Request failed');
    }
    res.status(200).json({ success: true });
} catch (error: any) {
  res.status(500).json({ success: false, error: error.message });
}
};
