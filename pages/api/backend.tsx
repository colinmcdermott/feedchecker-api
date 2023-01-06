import { GetServerSideProps } from 'next';
import * as http from 'http';
import * as url from 'url';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = url.parse(context.req.url, true).query;
  const hubURL = query.feed;

  if (!hubURL) {
    return {
      props: {
        error: 'No feed URL specified',
      },
    };
  }

  const apiURL = `/api/size?feed=${hubURL}`;

  try {
    const apiRes = await http.get(apiURL);
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      const size = JSON.parse(data).size;
      return {
        props: {
          size: size,
        },
      };
    });
  } catch (e) {
    return {
      props: {
        error: 'Could not get size of feed',
      },
    };
  }
};
