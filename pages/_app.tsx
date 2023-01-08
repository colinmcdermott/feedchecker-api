import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import localFont from '@next/font/local';

const ibmPlexSans = localFont({
  src: [
    {
      path: '../public/fonts/ibm-sans-500.woff2',
      weight: '500',
    },
    {
      path: '../public/fonts/ibm-sans-700.woff2',
      weight: '700',
    },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {ibmPlexSans.fonts.map((font) => (
          <link
            key={font.path}
            rel="preload"
            href={font.path}
            as="font"
            type="font/woff2"
            crossorigin
            fetchPriority="high"
          />
        ))}
      </Head>
      <main className={ibmPlexSans.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
