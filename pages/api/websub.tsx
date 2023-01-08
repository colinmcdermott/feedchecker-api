import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

interface Query {
  feed: string;
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feed = '' }: Query = req.query;
    if (!feed) {
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
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
