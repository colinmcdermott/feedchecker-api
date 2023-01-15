import express, { Request, Response, NextFunction } from 'express';
import fetch from 'isomorphic-unfetch';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
const NodeCache = require('node-cache');
import { MissingFeedParameterError, InvalidFeedParameterError, InvalidApiKeyError, FetchError } from './customerror'
import checkApiKey from './checkApiKey';
import { feedRegex, isValidFeed } from './feedValidator'

const app = express();
const feedSizeCache = new NodeCache({ stdTTL: 14400 /* seconds */ });

// Rate limiter config (upstash/ratelimit)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 h')
});

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
    return res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof InvalidFeedParameterError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof InvalidApiKeyError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof FetchError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

app.get('/api/rss', async (req, res, next) => {
  // Check if the request is from a paid user
  if ((req as any).isPaidUser) {
    try {
        const feed = req.query.feed as string;
        //validate the feed
        isValidFeed(feed);
        // Proceed with handling the request
        handleRequest(req, res, next);
    } catch (error) {
        next(new InvalidFeedParameterError());
    }
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