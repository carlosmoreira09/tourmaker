import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the workspace packages so live edits (tsup --watch) flow through.
  transpilePackages: ["@tourmaker/react", "@tourmaker/core"],
};

export default nextConfig;
