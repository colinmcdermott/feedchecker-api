import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';

// Create a map to store the feed sizes in memory
const feedSizes = new Map<string, number>();

async function fetchWebSub(feed: string) {
  try {
    const fetchResponse = await fetch(`https://nodefeedv.vercel.app/api/websub-fetch?feed=${feed}`);
    if (fetchResponse.status === 200) {
      const fetchResponseJSON = await fetchResponse.json();
      return fetchResponseJSON.success;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Make sure the req.url property is defined
    if (!req.url) {
      res.status(400).json({ error: 'Missing query string' });
      return;
    }
    
    // Parse the query string of the request
    const query = querystring.parse(req.url.split('?')[1]);
      
    // Get the feed parameter from the query object
    const feed = query.feed;

    // Make sure the feed parameter is a string
    if (typeof feed !== 'string') {
      res.status(400).json({ error: 'Invalid feed parameter: expected string' });
      return;
    }

    // Make a request to the custom API to get the size of the feed
    const response = await fetch(`https://nodefeedv.vercel.app/api/size?feed=${feed}`);

    // Check the response status
    if (response.status !== 200) {
      // If the status is not 200 OK, return an error
      res.status(response.status).json({ error: 'Failed to fetch feed' });
      return;
    }

    const data = await response.json();

    // Check if the feed size is already stored in memory
    let success = false; // initialize success to false
    let storedSize: number | undefined; // store the value of storedSize in a separate variable
    if (typeof feed === 'string' && feedSizes.has(feed)) {
      // If the feed size is already stored, compare it with the current size
      storedSize = feedSizes.get(feed);
      if (storedSize !== data.size) {
      // If the feed size is not stored, add it to the map
      if (typeof feed === 'string') {
        feedSizes.set(feed, data.size);
        console.log(`Stored new feed size: ${data.size}`);
      }
      
      // Print the size in the console
      console.log(data.size);
      
      // Respond with a success status and the size and success information in the body
    res.status(200).send({ 
      size: data.size, 
      success: success, 
      feedChanged: storedSize !== data.size // check if the feed size has changed
    });
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
};

