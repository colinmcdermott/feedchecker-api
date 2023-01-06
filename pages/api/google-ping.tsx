import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async function (req: NextApiRequest, res: NextApiResponse) {
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
    const response = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl.toString())}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Request failed');
    }
    res.status(200).json({ success: true });
  } catch (error: Error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
