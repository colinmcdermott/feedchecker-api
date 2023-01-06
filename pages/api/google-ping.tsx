import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export async function googlePingHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sitemap } = req.query;
    if (typeof sitemap !== 'string') {
      throw new Error('Sitemap URL must be a valid URL');
    }
    const decodedSitemap = decodeURIComponent(sitemap);
    const sitemapUrl = new URL(decodedSitemap);
    if (!(sitemapUrl instanceof URL)) {
      throw new Error('Sitemap URL must be a valid URL');
    }
    const googlePingURL = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl.toString())}`;
    const googlePingResponse = await fetch(googlePingURL);
    if (googlePingResponse.status !== 200) {
      throw new Error(`Error pinging Google: ${googlePingResponse.status}`);
    }
    res.status(200).json({ success: true });
  } catch (error: Error) {  // specify the type of the error variable as Error
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
