import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / Node-only modules must not be bundled by Next's server compiler.
  serverExternalPackages: ["better-sqlite3", "node-cron"],
  // Pin the workspace root (multiple lockfiles exist above this dir).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
