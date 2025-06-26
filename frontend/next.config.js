/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Docker production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add environment variables for API URL
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  },
};

module.exports = nextConfig;
