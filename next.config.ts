import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // chấp nhận mọi domain HTTPS
      },
      {
        protocol: 'http',
        hostname: '**',  // chấp nhận mọi domain HTTP
      }
    ]

  },
  reactStrictMode: false
};

export default nextConfig;
