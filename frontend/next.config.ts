import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'images.unsplash.com'
      },
      {
        hostname: '127.0.0.1'
      }
    ]
  }
};

export default nextConfig;
