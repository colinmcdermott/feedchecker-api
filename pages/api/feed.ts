import express, { Request, Response, NextFunction } from 'express';
import fetch from 'isomorphic-unfetch';
const NodeCache = require('node-cache');

const app = express();
const feedSizeCache = new NodeCache({ stdTTL: 14400 /* seconds */ });

const apiKeys = ['U6M05O7nQabjMlGdJuo9UiSxFrgYdTak', 'tZ07kgxshMNtd2GLqqlr6FuquArxLGy1'];

const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Check if the API key is supplied in the HTTP headers
  const apiKey = req.headers['feedping-api-key'] as string;
  if (apiKeys.includes(apiKey)) {
    // Set a flag in the request object indicating that the request is from a paid user
    (req as any).isPaidUser = true;
    // Add a header to the response indicating that a valid API key was provided
    res.setHeader('feedping-api-key-valid', 'true');
  } else {
    // Check if the API key is supplied in the URL parameters
    const apiKey = req.query.apiKey as string;
    if (apiKeys.includes(apiKey)) {
      // Set a flag in the request object indicating that the request is from a paid user
      (req as any).isPaidUser = true;
      // Add a header to the response indicating that a valid API key was provided
      res.setHeader('feedping-api-key-valid', 'true');
    } else {
      // Add a header to the response indicating that a valid API key was not provided
      res.setHeader('feedping-api-key-valid', 'false');
    }
  }
  next();
};

app.use(checkApiKey);

// Middleware function to handle request processing
const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
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
};

app.get('/api/feed', async (req, res, next) => {
// Check if the request is from a paid user
if ((req as any).isPaidUser) {
// Proceed with handling the request
handleRequest(req, res, next);
} else {
// Proceed with handling the request
handleRequest(req, res, next);
}
});

const getFeedSize = async (feed: string) => {
const sizeResponse = await fetch(`https://feedchecker-api.vercel.app/api/size?feed=${feed}`);
return (await sizeResponse.json()).size;
}

const fetchWebSubAPI = async (feed: string) => {
const response = await fetch(`https://feedchecker-api.vercel.app/api/websub-ping?feed=${feed}`);
return response.ok;
}

const fetchGooglePingAPI = async (feed: string) => {
const response = await fetch(`https://www.google.com/ping?sitemap=${feed}`);
return response.ok;
}

export default app;
