import '../styles/globals.css'
import type { AppProps } from 'next/app'
import localFont from '@next/font/local'

const ibmPlexSans500 = localFont({ src: '/fonts/ibm-sans-500.woff2' })
const ibmPlexSans700 = localFont({ src: '/fonts/ibm-sans-700.woff2' })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${ibmPlexSans500.className} ${ibmPlexSans700.className}`}>
      <Component {...pageProps} />
    </main>
  )
}

