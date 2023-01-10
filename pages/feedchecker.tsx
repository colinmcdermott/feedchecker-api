import React from 'react';
import Head from 'next/head';

function FeedCheckerHTML() {
  return (
    <main>
      <Head>
        <title>Feed Ping SEO Tool</title>
        <meta name='description' content='Speed up your search engine indexing and content discovery with automated RSS and Sitemap pinging from FeedPing.dev.' />
        <link rel='canonical' href='https://feedping.dev/' />
        <link rel='icon' type='image/svg+xml' href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2294%22>👋</text></svg>' />
      </Head>

      <form className='feedCheckForm'>
        <label htmlFor='hubURL'>RSS Feed URL:</label>
        <input
          type='url'
          name='hub.url'
          id='hubURL'
          placeholder='https://yourfeed.com/rss'
          required
        />
        <button type='submit'>Check Feed</button>
      </form>
      {feedSize !== null ? (
        <>
          <h2>Feed Size: {feedSize}</h2>
          <a href={debugLink} target='_blank' rel='noopener noreferrer'>
            Debug Hub
          </a>
          <p>{change}</p>
          {lastPing ? <p>Last ping: {lastPing}</p> : null}
        </>
      ) : null}
      {loading ? <p>Loading...</p> : null}
    </main>
  );
}

export default FeedCheckerHTML;