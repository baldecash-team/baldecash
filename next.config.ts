import type { NextConfig } from "next";

// Use NEXT_PUBLIC_BASE_PATH env var for GitHub Pages subdirectory deployment
// Leave empty for custom domain (demo.baldecash.com)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
    ],
  },
  turbopack: {},
};

export default nextConfig;
