import type { NextConfig } from "next";
import path from "path";

// The AI tool is mounted as a section of the main site at /app
// (https://ateliersupply.ru/app). basePath makes Next.js prefix every route,
// <Link>, router navigation, next/image src and static asset automatically.
// NEXT_PUBLIC_BASE_PATH is the single source of truth for raw fetch() URLs
// (which Next.js does NOT auto-prefix) — see src/lib/base-path.ts.
const BASE_PATH = "/app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // minimal self-contained server for Docker
  outputFileTracingRoot: path.join(__dirname), // confine file tracing to this project (pnpm/Windows)
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  // All imagery is served locally from `public/images` — no remote hosts.
};

export default nextConfig;
