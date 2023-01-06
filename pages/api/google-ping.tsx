import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export async function googlePingHandler(req: NextApiRequest, res: NextApiResponse) {
  const sitemapURL = req.query.feed;
  try {
    // validate the URL
    new URL(sitemapURL);
  } catch (error) {
    console.error(`Invalid sitemap URL: ${sitemapURL}`);
    // handle invalid URL as needed
  }
  const googlePingURL = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapURL)}`;
  try {
    const googlePingResponse = await fetch(googlePingURL);
    // handle googlePingResponse as needed
    if (googlePingResponse.status !== 200) {
      console.error(`Error pinging Google: ${googlePingResponse.status}`);
      // handle error as needed
    }
  } catch (error) {
    console.error(error);
    // handle error as needed
  }
  res.send('Success');
}
