import express, { Request, Response, NextFunction } from 'express';
import fetch from 'isomorphic-unfetch';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
const NodeCache = require('node-cache');
import { MissingFeedParameterError, InvalidFeedParameterError, InvalidApiKeyError, FetchError } from './customerror'

const app = express();
const feedSizeCache = new NodeCache({ stdTTL: 14400 /* seconds */ });
const feedRegex = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);

const checkFeedUrl = (req: Request, res: Response, next: NextFunction) => {
  const feed = req.query.feed as string;
  if (!feed) {
    throw new MissingFeedParameterError();
  }
  if (!feedRegex.test(feed)) {
    throw new InvalidFeedParameterError();
  }
  next();
};

// Rate limiter config (upstash/ratelimit)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 h')
});

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
      throw new InvalidApiKeyError();
    }
  }
  next();
};

app.use(checkFeedUrl);
app.use(checkApiKey);
  
// Middleware function to handle rate limiting and request processing
const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
  const feed = req.query.feed as string;
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
    next(new FetchError());
  }
};
  
// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MissingFeedParameterError) {
    return res.status(400).json({ message: err.message });
  } else if (err instanceof InvalidFeedParameterError) {
    return res.status(400).json({ message: err.message });
  } else if (err instanceof InvalidApiKeyError) {
    return res.status(401).json({ message: err.message });
  } else if (err instanceof FetchError) {
    return res.status(500).json({ message: err.message });
  } else {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

app.get('/api/rss', async (req, res, next) => {
  // Check if the request is from a paid user
  if ((req as any).isPaidUser) {
    // Proceed with handling the request
    handleRequest(req, res, next);
  } else {
    next(new InvalidApiKeyError());
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