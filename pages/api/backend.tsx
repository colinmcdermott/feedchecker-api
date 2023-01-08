import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';

// Create a map to store the feed sizes in memory
const feedSizes = new Map<string, number>();

// Function to make a request to the custom API to fetch the WebSub API
async function fetchWebSub(feed: string) {
  try {
    const fetchResponse = await fetch(`https://nodefeedv.vercel.app/api/websub-ping?feed=${feed}`);
    const fetchResponseJSON = await fetchResponse.json();
    return fetchResponseJSON.success;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Function to get the size of a feed from the custom API
async function getFeedSize(feed: string) {
  try {
    const response = await fetch(`https://nodefeedv.vercel.app/api/size?feed=${feed}`);
    const data = await response.json();
    return data.size;
  } catch (error) {
    console.error(error);
    return -1;
  }
}

// Function to handle the API route
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

    // Get the size of the feed
    const currentSize = await getFeedSize(feed);

    // Check if the feed size is already stored in memory
    let success = false; // initialize success to false
    let storedSize: number | undefined; // store the value of storedSize in a separate variable
    if (typeof feed === 'string' && feedSizes.has(feed)) {
      // If the feed size is already stored, compare it with the current size
      storedSize = feedSizes.get(feed);
      if (storedSize !== currentSize) {
        // If the sizes are different, update the stored size and fetch the WebSub API
        feedSizes.set(feed, currentSize);
        console.log(`Fetching WebSub API for new feed size: ${currentSize}`);
        success = await fetchWebSub(feed);
      } else {
        console.log(`Feed size is the same: ${currentSize}`);
      }
    } else {
      // If the feed size is not stored, add it to the map
      if (typeof feed === 'string') {
        feedSizes.set(feed, currentSize);
        console.log(`Stored new feed size: ${currentSize}`);
      }
    }
    
    // Print the size in the console
    console.log(currentSize);
    
    // Respond with a success status and the size and success information in the body
    res.status(200).send({ 
      size: currentSize, 
      success: success, 
      feedChanged: storedSize !== currentSize // check if the feed size has changed
    });
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
};

