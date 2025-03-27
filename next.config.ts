import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'simplefi.s3.us-east-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
