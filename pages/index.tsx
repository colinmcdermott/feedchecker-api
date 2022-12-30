import React, { useState, useEffect } from 'react';

function FeedChecker() {
  const [hubURL, setHubURL] = useState('');
  const [feedSize, setFeedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/size?feed=${hubURL}`);
    const data = await response.json();
    setFeedSize(data.size);
    setLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/size?feed=${hubURL}`);
      const data = await response.json();
      if (data.size !== feedSize) {
        setChange('New feed size - Ping sent!');
        document.getElementById('webSubPing')?.setAttribute(
          'src',
          `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`
        );
      } else {
        setChange('Feed size unchanged');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hubURL, feedSize]);

  return (
    <main>
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

      {loading && <div id='loading'>Starting</div>}
      {feedSize && <div id='results'>API Success! Feed size: {feedSize}</div>}

      <section className='statsWindow'>
        <div id='change'>{change}</div>
      </section>

      <iframe width='0' height='0' id='webSubPing'></iframe>
    </main>
  );
}

export default FeedChecker;
