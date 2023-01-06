import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

// Create a map to store the feed sizes in memory
const feedSizes = new Map<string, number>();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { feed } = req.query;

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
    if (feedSizes.has(feed as string)) {
        // If the feed size is already stored, compare it with the current size
        const storedSize = feedSizes.get(feed);
        if (storedSize !== data.size) {
            // If the sizes are different, update the stored size and ping the WebSub and GooglePing APIs
            feedSizes.set(feed, data.size);
            await fetch(`/api/websub-ping?feed=${feed}`);
            await fetch(`/api/google-ping?sitemap=${feed}`);
        }
    } else {
        // If the feed size is not stored, add it to the map
        feedSizes.set(feed, data.size);
    }

    // Print the size in the console
    console.log(data.size);

    // Respond with a success status and the size in the body
    res.status(200).send({ size: data.size });
  } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
}
