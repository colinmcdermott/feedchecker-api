import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Get the URL of the RSS feed from the query parameters
    const { feed } = req.query;

    // Make a HEAD request to the RSS feed URL
    const response = await fetch(`${feed}`, { method: 'HEAD' });

    // Check the response status
    if (response.status !== 200) {
      // If the status is not 200 OK, return an error
      res.status(response.status).json({ error: 'Failed to fetch feed' });
      return;
    }

    // Get the Content-Length header from the response
    const contentLength = response.headers.get('Content-Length');

    // Return the Content-Length in JSON
    res.json({ size: contentLength });
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
};
