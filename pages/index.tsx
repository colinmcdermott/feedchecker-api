import React, { useState, useEffect } from 'react';

const FeedCheckForm: React.FC = () => {
  const [hubURL, setHubURL] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState('');
  const [additional, setAdditional] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    setLoading(true);
  
    try {
      const response = await fetch(`/api/size=${hubURL}`);
      const data = await response.json();
      setResults(data);
      if (data === change) {
        setChange('Feed size unchanged');
      } else {
        setChange('New feed size');
        setAdditional(`https://websub-ping-tool.pages.dev/?feed=${hubURL}&auto=true`);
        document.getElementById('webSubPing')?.setAttribute('src', additional);
      }
    } catch (error) {
      setResults('Error: ' + (error as Error).message);
    }
  
    setLoading(false);
  };  

  useEffect(() => {
    const interval = setInterval(() => {
      handleSubmit(event);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
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
        onChange={event => setHubURL(event.target.value)}
      />
      <input type='submit' value='Submit' id='submit' />
    </form>
  );
};

const Results: React.FC = () => {
  const [results, setResults] = useState('');

  return <results id='results'>{results}</results>;
};

const Loading: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return <loading id='loading'>{loading ? 'Loading...' : ''}</loading>;
};

const Change: React.FC = () => {
  const [change, setChange] = useState('');

  return <change id='change'>{change}</change>;
};

const Additional: React.FC = () => {
  const [additional, setAdditional] = useState('');

  return <additional id='additional'>{additional}</additional>;
};

const App: React.FC = () => {
  return (
    <main>
      <FeedCheckForm />
      <Results />
      <Loading />
      <section className="statsWindow">
        <Change />
        <Additional />
      </section>
    </main>
    <iframe width="0" height="0" id="webSubPing"></iframe>
  );
};

export default App;
