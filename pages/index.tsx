import React, { useState, useEffect } from 'react';
import FeedCheckerHTML from './FeedCheckerHTML';

function FeedChecker() {
  const [hubURL, setHubURL] = useState('');
  const [feedSize, setFeedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState('');
  const [debugLink, setDebugLink] = useState('');
  const [lastPing, setLastPing] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/size?feed=${hubURL}`);
    const data = await response.json();
    setFeedSize(data.size);
    setLoading(false);
    setDebugLink(`https://pubsubhubbub.appspot.com/topic-details?hub.url=${hubURL}`);
  };

  useEffect(() => {
    if (feedSize !== null) {
      const interval = setInterval(async () => {
        const response = await fetch(`/api/size?feed=${hubURL}`);
        const data = await response.json();
        if (data.size !== feedSize) {
          setFeedSize(data.size);
          setChange(`New feed size - Ping sent! - ${new Date().toUTCString()}`);
          try {
            const pingResponse = await fetch(`/api/websub-ping?feed=${hubURL}`);
            if (pingResponse.status !== 200) {
              console.error(`Error pinging WebSub: ${pingResponse.status}`);
            }
          } catch (error) {
            console.error(error);
          }
          const googlePingURL = `/api/google-ping?sitemap=${encodeURIComponent(hubURL)}`;
          try {
            const googlePingResponse = await fetch(googlePingURL);
            if (googlePingResponse.status !== 200) {
              console.error(`Error pinging Google: ${googlePingResponse.status}`);
            }
          } catch (error) {
            console.error(error);
          }
          setLastPing(new Date().toUTCString());
        } else {
          setChange(`Feed size unchanged - ${new Date().toUTCString()}`);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [feedSize, hubURL]);

  return <FeedCheckerHTML />;
}

export default FeedChecker;