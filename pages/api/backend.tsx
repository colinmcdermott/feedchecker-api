import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';
import querystring from 'querystring';

// Create a map to store the feed sizes in memory
const feedSizes = new Map<string, number>();

async function sendPing(feed: string) {
  try {
    const pingResponse = await fetch(`https://nodefeedv.vercel.app/api/websub-ping?feed=${feed}`);
    if (pingResponse.status === 200) {
      const pingResponseJSON = await pingResponse.json();
      return pingResponseJSON.success;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Parse the query string of the request
    if (typeof req.url !== 'undefined') {
      const query = querystring.parse(req.url.split('?')[1]);
      
      // Get the feed parameter from the query object
      const feed = query.feed;

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
      if (feedSizes.has(feed)) {
        // If the feed size is already stored, compare it with the current size
        storedSize = feedSizes.get(feed);
        if (storedSize !== data.size) {
          // If the sizes are different, update the stored size and send a ping to the WebSub API
          feedSizes.set(feed, data.size);
          console.log(`Sending pings for new feed size: ${data.size}`);
          success = await sendPing(feed);
        } else {
          console.log(`Feed size is the same: ${data.size}`);
        }
      } else {
        // If the feed size is not stored, add it to the map
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
    }
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
};
