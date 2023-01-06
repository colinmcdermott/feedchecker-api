import { useState, useEffect } from 'react';

async function getFeedSize(hubURL: string) {
  try {
    const response = await fetch(`/api/size?feed=${hubURL}`);
    const data = await response.json();
    console.log(`Feed size: ${data.size}`);
  } catch (error) {
    console.error(error);
  }
}

function FeedChecker() {
  const [hubURL, setHubURL] = useState('');

  useEffect(() => {
    getFeedSize(hubURL);
  }, [hubURL]);
}

export default FeedChecker;
