import CopyPlugin from 'copy-webpack-plugin';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@sidan-lab/whisky-js-nodejs'],
  webpack: function (config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.resolve.fallback = {
      fs: false,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    if (isServer) {
      // Copy WASM files to various locations where Next.js might look for them
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            // Copy to root server directory
            {
              from: path.resolve('./node_modules/@sidan-lab/whisky-js-nodejs/whisky_js_bg.wasm'),
              to: path.resolve('./.next/server/whisky_js_bg.wasm'),
              noErrorOnMissing: true,
            },
          ],
        }),
      );

      // Configure aliases for server-side WASM resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        'whisky_js_bg.wasm': path.resolve('./node_modules/@sidan-lab/whisky-js-nodejs/whisky_js_bg.wasm'),
      };
    } else {
      // Client-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        'whisky_js_bg.wasm': path.resolve('./node_modules/@sidan-lab/whisky-js-browser/whisky_js_bg.wasm'),
      };
    }

    return config;
  },
};

export default nextConfig;
