import process from 'node:process';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import('./src/app/constants/env/server.mjs');

const isDev = process.env.VERCEL_ENV === 'development';

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    // https://mantine.dev/guides/next/#app-router-tree-shaking
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    dynamicIO: true,
  },
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  reactStrictMode: true,
  transpilePackages: ['@bypass/shared', '@bypass/trpc'],
  webpack: (config, { dev, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.plugins.push(
      new webpack.DefinePlugin({
        PROD_ENV: JSON.stringify(!isDev),
        HOST_NAME: JSON.stringify(process.env.HOST_NAME),
      })
    );
    if (dev) {
      config.plugins.push(new ForkTsCheckerWebpackPlugin());
    }
    return config;
  },
};

export default nextConfig;
