import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.resfu.com"],
  },
  // Configure for Vercel serverless environment
  serverExternalPackages: ["puppeteer-core", "puppeteer"],
};

export default nextConfig;
