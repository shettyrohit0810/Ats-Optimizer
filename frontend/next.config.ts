import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Netlify configuration
  trailingSlash: true,
  // Enable serverless functions for Netlify
  serverExternalPackages: [],
};

export default nextConfig;
