import React from 'react';

export const Content = () => (
  <>
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

<p>Responses with a valid API key will include a HTTP header with <code>feedping-api-key-valid: true</code>.</p>

<h3>Terms</h3>

<p>Only use this tool to fetch URLs for resources that you own or have permission to access. Please do not submit an excessive number of requests to the API.</p>

<h3>Credit & Copyright</h3>

<p>Tool created by <a href='https://twitter.com/ColinMcDermott' target='_blank'>Colin McDermott</a>.</p>

</section>
  </>
);
