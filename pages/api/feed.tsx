import express from 'express';
import fetch from 'isomorphic-unfetch';

const app = express();
const feedSizes = new Map<string, number>();

app.get('/api/feed', async (req, res) => {
  const feed = req.query.feed as string;
  if (!feed) {
    return res.status(400).json({ error: 'Missing "feed" query parameter' });
  }

  try {
    // Check the size of the feed
    const sizeResponse = await fetch(`https://nodefeedv.vercel.app/api/size?feed=${feed}`);
    const sizeData = await sizeResponse.json();
    const size = sizeData.size;
    const storedSize = feedSizes.get(feed);
    const sizeChanged = storedSize !== size;

    // Update the stored size in the map
    feedSizes.set(feed, size);

    // Fetch the WebSub API if the size has changed
    if (sizeChanged) {
      const webSubResponse = await fetch(`https://nodefeedv.vercel.app/api/websub-fetch?feed=${feed}`);
      const webSubSuccess = webSubResponse.ok;
      return res.json({ size, sizeChanged, webSubFetchSuccess: webSubSuccess });
    } else {
      return res.json({ size, sizeChanged });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error checking feed size or fetching WebSub API' });
  }
});

export default app;
