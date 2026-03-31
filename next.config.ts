import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pearly-bucket.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
