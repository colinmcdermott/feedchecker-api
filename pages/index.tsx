import { useEffect, useState } from 'react';

const FeedCheckForm: React.FC = () => {
  const [hubURL, setHubURL] = useState('');
  const [results, setResults] = useState('');
  const [change, setChange] = useState('');
  const [additional, setAdditional] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true);
      const response = await fetch(`/api/size=${hubURL}`);
      const data = await response.json();
      if (results === data) {
        setChange('Feed size unchanged');
      } else {
        setResults(data);
        setChange('New feed size');
        setAdditional(`Loaded new URL: https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`);
        document.getElementById('webSubPing')?.setAttribute('src', `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`);
      }
      setLoading(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [hubURL, results]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/size=${hubURL}`);
    const data = await response.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <form className='feedCheckForm' onSubmit={handleSubmit}>
      <label htmlFor='hubURL'>RSS Feed URL:</label>
      <input
        type='url'
        name='hub.url'
        placeholder='https://example.com/feed/'
        pattern='https://.*'
        id='hubURL'
        required
        value={hubURL}
        onChange={event => setHubURL(event.target.value)}
      />

      <input type='submit' value='Submit' id='submit' />
      {loading && <loading id='loading'>Loading...</loading>}
      {results && (
        <>
          <results id='results'>{results}</results>
          <section className='statsWindow'>
            <change id='change'>{change}</change>
            {additional && <additional id='additional'>{additional}</additional>}
          </section>
        </>
      )}
    </form>
  );
};

export default FeedCheckForm;
