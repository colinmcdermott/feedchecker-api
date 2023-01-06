import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';

interface SizeResponse {
  size: number;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the URL of the RSS feed or XML sitemap from the query string
  const { hubURL } = req.query;

  // Make a GET request to your custom API to get the size of the feed
  const response = await fetch(`/api/size?feed=${hubURL}`);
  const data: SizeResponse = await response.json();

  // Print the size value to the page
  res.send(`The size of the feed is: ${data.size}`);
};
