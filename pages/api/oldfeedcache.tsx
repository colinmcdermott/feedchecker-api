import express from 'express';
import fetch from 'isomorphic-unfetch';
const NodeCache = require('node-cache');

const app = express();
const feedSizeCache = new NodeCache({ stdTTL: 14400 /* seconds */ });

app.get('/api/feedcache', async (req, res) => {
    const feed = req.query.feed as string;
    if (!feed) {
      return res.status(400).json({ error: 'Missing "feed" query parameter' });
    }
  
    try {
      const size = await getFeedSize(feed);
      const storedSize = feedSizeCache.get(feed);
      const sizeChanged = storedSize !== size;
  
      // Update the stored size in the cache
      feedSizeCache.set(feed, size);
  
      // Fetch the WebSub and Google Ping APIs if the size has changed
      if (sizeChanged) {
        const webSubSuccess = await fetchWebSubAPI(feed);
        const googlePingSuccess = await fetchGooglePingAPI(feed);
        return res.json({ size, sizeChanged, webSubFetchSuccess: webSubSuccess, googlePingSuccess });
      } else {
        return res.json({ size, sizeChanged });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error checking feed size or fetching WebSub/Google Ping APIs' });
    }
});

const getFeedSize = async (feed: string) => {
  const sizeResponse = await fetch(`https://nodefeedv.vercel.app/api/size?feed=${feed}`);
  return (await sizeResponse.json()).size;
}

const fetchWebSubAPI = async (feed: string) => {
  const response = await fetch(`https://nodefeedv.vercel.app/api/websub-ping?feed=${feed}`);
  return response.ok;
}

const fetchGooglePingAPI = async (feed: string) => {
  const response = await fetch(`https://www.google.com/ping?sitemap=${feed}`);
  return response.ok;
}

export default app;
