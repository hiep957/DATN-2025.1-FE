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
  rewrites: async () => {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://8bf71b615de0.ngrok-free.app/:path*' // Thay đổi thành URL backend của bạn
      }
    ]
  },
  reactStrictMode: false
};

export default nextConfig;
