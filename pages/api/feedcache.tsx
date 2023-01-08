import express from 'express';
import fetch from 'isomorphic-unfetch';
const NodeCache = require('node-cache');

const app = express();
const feedSizeCache = new NodeCache({ stdTTL: 60 /* seconds */ });

app.get('/api/feedcache', async (req, res) => {
    const feed = req.query.feed as string;
    if (!feed) {
      return res.status(400).json({ error: 'Missing "feed" query parameter' });
    }
  
    try {
      // Check the size of the feed
      const sizeResponse = await fetch(`https://nodefeedv.vercel.app/api/size?feed=${feed}`);
      const size = (await sizeResponse.json()).size;
      const storedSize = feedSizeCache.get(feed);
      const sizeChanged = storedSize !== size;
  
      // Update the stored size in the cache
      feedSizeCache.set(feed, size);
  
      // Fetch the WebSub and Google Ping APIs if the size has changed
      if (sizeChanged) {
        const webSubResponse = await fetch(`https://nodefeedv.vercel.app/api/websub-ping?feed=${feed}`);
        const webSubSuccess = webSubResponse.ok;
        const googlePingResponse = await fetch(`https://www.google.com/ping?sitemap=${feed}`);
        const googlePingSuccess = googlePingResponse.ok;
        return res.json({ size, sizeChanged, webSubFetchSuccess: webSubSuccess, googlePingSuccess });
      } else {
        return res.json({ size, sizeChanged });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error checking feed size or fetching WebSub/Google Ping APIs' });
    }
});
  
export default app;
