import { GetServerSideProps } from 'next';
import * as http from 'http';
import * as url from 'url';

export const getServerSideProps: GetServerSideProps = async (context) => {
  let query = {};
  if (context.req.url) {
    query = url.parse(context.req.url, true).query;
  }
  const hubURL = query.feed;

  let size = null;
  let error = null;

  if (!hubURL) {
    error = 'No feed URL specified';
  } else {
    const apiURL = `/api/size?feed=${hubURL}`;

    try {
      const apiRes = await http.get(apiURL);
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        size = JSON.parse(data).size;
      });
    } catch (e) {
      error = 'Could not get size of feed';
    }
  }

  return {
    props: {
      size: size,
      error: error,
    },
  };
};
