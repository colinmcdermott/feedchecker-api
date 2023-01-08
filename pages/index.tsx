import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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
        <title>Feed Ping Tool</title>
        <link rel='canonical' href='https://feedping.dev/' />
        <link rel='icon' type='image/svg+xml' href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2294%22>👋</text></svg>' />
      </Head>
      <section>
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
      </section>

      <section>
        {loading && <div id='loading'><p>Connecting to API...</p></div>}
        {feedSize && <div id='results'><p>API Success! Feed size: {feedSize} - Check interval: 30 seconds</p></div>}
      </section>

      <section className='statsWindow'>
        <div id='change'>{change}</div>
        {lastPing ? (
          <div id='lastPing'>
            Last ping sent: <time>{lastPing}</time>
          </div>
        ) : (
          <div id='lastPing'></div>
        )}
        {debugLink && <div id='debug'><p><a href={debugLink} target='_blank'>Debug</a></p></div>}
      </section>
      
      <section>

        <h2>What is this tool?</h2>
        <p>This tool checks an RSS feed or XML sitemap at 30 second intervals, and if it detects a new size - it sends a ping to Google's <a href='https://pubsubhubbub.appspot.com/' target='_blank'>WebSub hub</a> and Google Search Console.</p>
        <p>This should trigger Google to crawl the specified feed immediately.</p>
        <h3>API</h3>
        <p>The API takes a URL input, checks the size of the feed, then pings WebSub & Google if the feed has changed. The API stores the size of the file in memory so you can call the API server-side via a Cron job, without the risk of sending multiple pings.</p>
        <p>Send a request to the <code>/api/feedcache</code> API with a <code>feed</code> URL parameter and get a JSON response back. For example:</p>
        <p><code>https://feedping.dev/api/feedcache?feed=https://example.com/feed/</code></p>
        <p>A typical <em>successful API response</em> where the feed size is new and pings have been sent will look like this:</p> 

          <code>
              <pre>
                  <span>&#123;</span><br/>
                    <span><em>"size"</em>:<em>123456</em>,</span><br/>
                    <span><em>"sizeChanged"</em>:<em>true</em>,</span><br/>
                    <span><em>"webSubFetchSuccess"</em>:<em>true</em>,</span><br/>
                    <span><em>"googlePingSuccess"</em>:<em>true</em></span><br/>
                  <span>&#125;</span>
            </pre>
          </code>
        
        <p>If the feed size is unchanged, the response will look like this:</p>

        <code>
          <pre>
              <span>&#123;</span><br/>
                <span><em>"size"</em>:<em>123456</em>,</span><br/>
                <span><em>"sizeChanged"</em>:<em>false</em></span><br/>
              <span>&#125;</span>
          </pre>
        </code>

        <p>If the API responds with a 500 error, or an other error message, there has been a problem accessing the feed or one of the API services.</p>

      </section>

    </main>
  );
}

export default FeedChecker;
