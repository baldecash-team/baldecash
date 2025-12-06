import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/baldecash",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
