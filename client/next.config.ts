import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@foxglove/crc'],
  reactStrictMode: true,
  webpack: function (config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
