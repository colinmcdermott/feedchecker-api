import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'isomorphic-unfetch';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { feed } = req.query;

    // Make a request to the custom API to get the size of the feed
    const response = await fetch(`/api/size?feed=${feed}`);
    const data = await response.json();

    // Print the size in the console
    console.log(data.size);

    // Respond with a success status and the size in the body
    res.status(200).send({ size: data.size });
    } catch (error) {
    // If there was an error, return a server error
    res.status(500).json({ error: 'Internal server error' });
  }
}
