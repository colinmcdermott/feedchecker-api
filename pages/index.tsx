import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import HomeContent from './homecontent.js';

function FeedChecker() {
  const [hubURL, setHubURL] = useState('');
  const [feedSize, setFeedSize] = useState(null);
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
    if (feedSize !== null) { // only set up the interval if feedSize is not null
      const interval = setInterval(async () => {
        const response = await fetch(`/api/size?feed=${hubURL}`);
        const data = await response.json();
        if (data.size !== feedSize) {
          setFeedSize(data.size);
          setChange(`New feed size - Ping sent! - ${new Date().toUTCString()}`);
          try {
            // send ping to your new service
            const pingResponse = await fetch(`/api/websub-ping?feed=${hubURL}`);
            // handle pingResponse as needed
            if (pingResponse.status !== 200) {
              console.error(`Error pinging WebSub: ${pingResponse.status}`);
              // handle error as needed
            }
          } catch (error) {
            console.error(error);
            // handle error as needed
          }
          // send ping to Google Sitemap API
          const googlePingURL = `/api/google-ping?sitemap=${encodeURIComponent(hubURL)}`;
          try {
            const googlePingResponse = await fetch(googlePingURL);
            // handle googlePingResponse as needed
            if (googlePingResponse.status !== 200) {
              console.error(`Error pinging Google: ${googlePingResponse.status}`);
              // handle error as needed
            }
          } catch (error) {
            console.error(error);
            // handle error as needed
          }
          setLastPing(new Date().toUTCString());
        } else {
          setChange(`Feed size unchanged - ${new Date().toUTCString()}`);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [feedSize, hubURL]);

  return (
    <main>
      <Head>
        <title>Feed Ping SEO Tool</title>
        <meta name='description' content='Speed up your search engine indexing and content discovery with automated RSS and Sitemap pinging from FeedPing.dev.' />
        <link rel='canonical' href='https://feedping.dev/' />
        <link rel='icon' type='image/svg+xml' href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2294%22>👋</text></svg>' />
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

      <section className='statsWindow'>

        {loading && <div id='loading'><p>Connecting to API...</p></div>}
        {feedSize && <div id='results'><p>API Success! Feed size: {feedSize} - Check interval: 30 seconds</p></div>}
        
        <div id='change'><p>{change}</p></div>
        {lastPing ? (
          <div id='lastPing'>
            <p>Last ping sent: <time>{lastPing}</time></p>
          </div>
        ) : (
          <div id='lastPing'></div>
        )}

        {debugLink && <div id='debug'><p><a href={debugLink} target='_blank'>Debug</a></p></div>} 
        
      </section>

      <HomeContent />

    </main>
  );
}

export default FeedChecker;