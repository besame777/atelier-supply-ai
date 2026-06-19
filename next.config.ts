import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // All imagery is served locally from `public/images` — no remote hosts.
};

export default nextConfig;
