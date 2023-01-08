// next.config.js
module.exports = {
  reactStrictMode: true,
  headers: [
    {
      source: '/fonts/ibm-sans-500.woff2',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31557600',
        },
      ],
    },
    {
      source: '/fonts/ibm-sans-700.woff2',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31557600',
        },
      ],
    },
  ],
}