import { NextApiRequest, NextApiResponse } from 'next';

export default async function feedSize(req: NextApiRequest, res: NextApiResponse) {
  const { feed } = req.query;
  const response = await fetch(`/api/size?feed=${feed}`);
  const data = await response.json();
  console.log(data.size);
  res.status(200).end();
}
