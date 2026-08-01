import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in C:\Users\Admin makes Next infer the wrong
  // workspace root, so pin it to this project.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
