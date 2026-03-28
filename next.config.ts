import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: basePath,
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
      {
        protocol: "https",
        hostname: "baldecash.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "baldecash.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "databalde-cashsys.s3.amazonaws.com",
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;
