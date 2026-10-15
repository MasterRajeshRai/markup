/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@markup/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.mediabirdmag.com',
      },
      {
        protocol: 'https',
        hostname: 'mediabirdmag.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Permanent redirects to preserve legacy URLs if necessary
  async redirects() {
    return [
      {
        source: '/feed',
        destination: '/api/rss',
        permanent: true,
      },
      {
        source: '/feed/',
        destination: '/api/rss',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
