import type { NextConfig } from "next";
import { createCloudflareAdapter } from "@cloudflare/next-on-pages";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default createCloudflareAdapter(nextConfig);
