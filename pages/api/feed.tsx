import express from 'express';
import request from 'request';

const app = express();
const feedSizes = new Map<string, number>();

app.get('/api/feed', (req, res) => {
  const feed = req.query.feed;
  if (!feed) {
    return res.status(400).json({ error: 'Missing "feed" query parameter' });
  }

  // Check the size of the feed
  request(`https://nodefeedv.vercel.app/api/size?feed=${feed}`, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Error checking feed size' });
    }

    const size = JSON.parse(body).size;
    const storedSize = feedSizes.get(feed);
    const sizeChanged = storedSize !== size;

    // Update the stored size in the map
    feedSizes.set(feed, size);

    // Fetch the WebSub API if the size has changed
    if (sizeChanged) {
      request(`https://nodefeedv.vercel.app/api/websub-fetch?feed=${feed}`, (error, response, body) => {
        if (error) {
          return res.status(500).json({ error: 'Error fetching WebSub API', size, sizeChanged });
        }

        return res.json({ size, sizeChanged, webSubFetchSuccess: true });
      });
    } else {
      return res.json({ size, sizeChanged });
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on port ${port}!`));
