import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / Node-only modules must not be bundled by Next's server compiler.
  serverExternalPackages: ["better-sqlite3", "node-cron"],
  // Allow cross-origin dev requests from the LAN IP used to reach the dev server.
  allowedDevOrigins: ["192.168.86.23"],
  // Pin the workspace root (multiple lockfiles exist above this dir).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
