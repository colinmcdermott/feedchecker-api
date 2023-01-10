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
      
      <section>

        <h2>What is this tool?</h2>

        <p>FeedPing.dev (currently in beta testing) checks an RSS feed or XML sitemap and if the API detects a new size - it sends a ping to Google's <a href='https://pubsubhubbub.appspot.com/' target='_blank'>WebSub hub</a> and Google Search Console.</p>
        <p>This should trigger Google to crawl the specified feed immediately.</p>

        <h3>Web UI</h3>

        The Web UI checks a feed/sitemap at 30 second intervals.

        <h3>API</h3>

        <p>Send a request to the <code>/api/feed</code> API with your RSS feed or XML sitemap URL using a <code>feed</code> URL parameter, and get a JSON response back. For example:</p>
        
        <code><pre><span>https://feedping.dev/api/feed<em>?feed=</em><em>https://example.com/feed/</em></span></pre></code>

        <p>The API takes a URL input, checks the size of the feed, then pings the Google WebSub hub & Search Console if the feed has changed. The API stores the size of the file in memory so you can call the API server-side via a Cron job, without the risk of sending multiple pings.</p>

        <p>A typical successful API response where the feed size is new and pings have been sent will look like this:</p> 

          <code className='json'>
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

        <code className='json'>
          <pre>
              <span>&#123;</span><br/>
                <span><em>"size"</em>:<em>123456</em>,</span><br/>
                <span><em>"sizeChanged"</em>:<em>false</em></span><br/>
              <span>&#125;</span>
          </pre>
        </code>

        <p>If the API responds with a 500 error, or any other error message, there has been an issue with the feed or one of the API services.</p>

        <p>Make sure you are using the <code>feed</code> URL parameter with the correct URL of your feed.</p>

        <h3>API Rate Limits & API Keys</h3>

        <p>The API is currently rate-limited to 30 requests per hour. For an API key to go above this limit please get in contact.</p>

        <p>To submit a request using an API include the <code>apiKey</code> URL parameter, eg:</p>

        <code><pre><span>https://feedping.dev/api/feed<em>?feed=https://example.com/feed/</em><em>&apiKey=abcdefghijklmno</em></span></pre></code>

        <p>You can also supply the API key as an <code>feedping-api-key</code> HTTP header in the request.</p>

        <p>For example to make a GET request to the <code>/api/feed</code> route with an API key of abcdefghijklmno, use a command like this:</p>

        <code><pre><span>curl -H "feedping-api-key: abcdefghijklmno" https://feedping.dev/api/feed?feed=https://example.com/feed/</span></pre></code>

        <h3>Terms</h3>

        <p>Only use this tool to fetch URLs for resources that you own or have permission to access. Please do not submit an excessive number of requests to the API.</p>

        <h3>Credit & Copyright</h3>

        <p>Tool created by <a href='https://twitter.com/ColinMcDermott' target='_blank'>Colin McDermott</a>.</p>

      </section>

    </main>
  );
}

export default FeedChecker;