import React, { useState, useEffect } from 'react';
import Head from 'next/head';

function FeedChecker() {
  const [hubURL, setHubURL] = useState('');
  const [feedSize, setFeedSize] = useState(-1); // initialize feedSize to -1
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState('');
  const [debugLink, setDebugLink] = useState('');
  const [lastPing, setLastPing] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/size?feed=${hubURL}`);
    const data = await response.json();
    setFeedSize(data.size);
    setLoading(false);
    setDebugLink(`https://pubsubhubbub.appspot.com/topic-details?hub.url=${hubURL}`);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/size?feed=${hubURL}`);
      const data = await response.json();
      if (data.size !== feedSize) {
        setFeedSize(data.size);
        setChange(`New feed size - Ping sent! - ${new Date().toUTCString()}`);
        document.getElementById('webSubPing')?.setAttribute(
          'src',
          `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`
        );
        document.getElementById('gscPing')?.setAttribute(
          'src',
          `https://www.google.com/ping?sitemap=${hubURL}`
        );
        setLastPing(new Date().toUTCString());
      } else {
        setChange(`Feed size unchanged - ${new Date().toUTCString()}`);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hubURL]);

  return (
    <main>
      <Head>
        <title>Node Feed Checker</title>
      </Head>
      <form className='feedCheckForm' onSubmit={handleSubmit}>
        <label htmlFor='hubURL'>RSS Feed URL:</label>
        <input
          type='url'
          name='hub.url'
          placeholder='https://example.com/feed/'
          pattern='https://.*'
          id='hubURL'
          value={hubURL}
          onChange={(event) => setHubURL(event.target.value)}
          required
        />
        <input type='submit' value='Submit' id='submit' />
      </form>

      {loading && <div id='loading'><p>Connecting to API...</p></div>}
      {feedSize && <div id='results'><p>API Success! Feed size: {feedSize} - Check interval: 30 seconds</p></div>}

      <section className='statsWindow'>
        <div id='change'>{change}</div>
        {lastPing ? (
          <div id='lastPing'>
            Last ping sent: <time>{lastPing}</time>
          </div>
        ) : (
          <div id='lastPing'></div>
        )}
      </section>

      {debugLink && <div id='debug'><p><a href={debugLink} target='_blank'>Debug</a></p></div>}

      <iframe width='0' height='0' id='webSubPing'></iframe>
      <iframe width='0' height='0' id='gscPing'></iframe>

    </main>
  );
}

export default FeedChecker;