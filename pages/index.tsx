import { useState, useEffect } from 'react';

const FeedCheckForm: React.FC = () => {
  const [hubURL, setHubURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');
  const [change, setChange] = useState('');
  const [additional, setAdditional] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    fetch(`/api/size=${hubURL}`)
      .then((response) => response.json())
      .then((data) => {
        setResults(data.size);
        if (data.size === results) {
          setChange('Feed size unchanged');
        } else {
          setChange('New feed size');
          const iframe = document.getElementById('webSubPing');
          if (iframe) {
            iframe.src = `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`;
          }
        }
      })
      .catch((error) => {
        setAdditional(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/size=${hubURL}`)
        .then((response) => response.json())
        .then((data) => {
          setResults(data.size);
          if (data.size === results) {
            setChange('Feed size unchanged');
          } else {
            setChange('New feed size');
            const iframe = document.getElementById('webSubPing');
            if (iframe) {
              iframe.src = `https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`;
            }
          }
        })
        .catch((error) => {
          setAdditional(error.message);
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [hubURL]);

  return (
    <main>
      <form className='feedCheckForm' onSubmit={handleSubmit}>
        <label htmlFor='hubURL'>RSS Feed URL:</label>
        <input
          type='url'
          name='hub.url'
          placeholder='https://example.com/feed/'
          pattern='https://.*'
          size='38'
          id='hubURL'
          required
          value={hubURL}
          onChange={(event) => setHubURL(event.target.value)}
        />
        <input type='submit' value='Submit' id='submit' />
      </form>

      {loading ? (
        <div id='loading'>Starting...      ) : (
          <div id='results'>{results}</div>
        )}
  
        <section className='statsWindow'>
          <div id='change'>{change}</div>
          <div id='additional'>{additional}</div>
        </section>
      </main>
  
      <iframe width='0' height='0' id='webSubPing' />
    );
  };
  
  export default FeedCheckForm;
  
