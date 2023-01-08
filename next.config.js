// next.config.js

const apiMiddleware = (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex');
  next();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverMiddleware: [
    apiMiddleware
  ],
}

module.exports = nextConfig;