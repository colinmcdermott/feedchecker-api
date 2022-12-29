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
      try {
        const response = await fetch(`/api/size=${hubURL}`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        console.log(`hubURL: ${hubURL}`);
        if (results === data) {
          setChange('Feed size unchanged');
        } else {
          setResults(data);
          setChange('New feed size');
          setAdditional(`Loaded new URL: https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`);
          document.getElementById('webSubPing')?.setAttribute('src', `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [hubURL, results]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/size=${hubURL}`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
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
      {loading && <div id='loading'>Loading...</div>}
      {results && (
        <>
          <div id='results'>{results}</div>
          <section className='statsWindow'>
            <div id='change'>{change}</div>
            {additional && <div id='additional'>{additional}</div>}
          </section>
        </>
      )}
    </form>
  );
};

export default FeedCheckForm;
