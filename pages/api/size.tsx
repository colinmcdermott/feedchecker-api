import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import { parse as parseUrl } from 'url';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Get the URL of the RSS feed from the query parameters
    const { feed } = req.query;

    // Parse the URL using the `url` module
    const parsedUrl = parseUrl(feed);

    // Check if the `parsedUrl` object has a `hostname` property
    if (!parsedUrl.hostname) {
      // If it does not, the `feed` query parameter is not a valid URL
      res.status(400).json({ error: 'Invalid feed URL' });
      return;
    }

    // Make a GET request to the RSS feed URL
    const response = await fetch(`${feed}`);

    // Check the response status
    if (response.status !== 200) {
      // If the status is not 200 OK, return an error
      res.status(response.status).json({ error: 'Failed to fetch feed' });
      return;
    }

    // Get the content of the RSS feed as a string
    const content = await response.text();

    // Calculate the size of the content
    const size = content.length;

    // Return the size in JSON
    res.json({ size });
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
};
