import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone' and basePath: '/admin' are set during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
