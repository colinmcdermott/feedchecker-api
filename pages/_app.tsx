import '../styles/globals.css'
import type { AppProps } from 'next/app'
import localFont from '@next/font/local'

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
    <main className={ibmPlexSans.className}>
      <Component {...pageProps} />
    </main>
  );
}
