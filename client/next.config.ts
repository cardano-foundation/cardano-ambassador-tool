import type { NextConfig } from "next";
import CopyPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: function (config, { isServer }) {

    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.resolve.fallback = {
      fs: false,
    };

    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: './public/whisky_js_bg.wasm',
              to: '../server/vendor-chunks/whisky_js_bg.wasm',
              noErrorOnMissing: true,
            },
          ],
        })
      );
    }

    return config;
  },
};

export default nextConfig;
