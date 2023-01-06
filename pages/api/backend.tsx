const express = require('express');

const app = express();

async function fetchFeedSize(hubURL) {
  try {
    const response = await fetch(`/api/size?feed=${hubURL}`);
    const data = await response.json();
    return data.size;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.get('/feed-size', async (req, res) => {
  try {
    const hubURL = req.query.feed;
    const size = await fetchFeedSize(hubURL);
    res.send({ size });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching the feed size.' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
