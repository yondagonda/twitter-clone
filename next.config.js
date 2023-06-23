/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'firebasestorage.googleapis.com',
    //     port: '',
    //     pathname: '/account123/**',
    //   },
    // ],
  },
};

module.exports = nextConfig;
