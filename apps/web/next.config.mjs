import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import nextPWA from 'next-pwa';

import('./src/constants/env/server.mjs');

const isDev = process.env.VERCEL_ENV === 'development';

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  productionBrowserSourceMaps: true,
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  reactStrictMode: true,
  transpilePackages: ['@bypass/shared'],
  webpack: (config, { dev, isServer, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.plugins.push(
      new webpack.DefinePlugin({
        PROD_ENV: JSON.stringify(!dev),
        HOST_NAME: JSON.stringify(process.env.HOST_NAME),
      })
    );
    if (dev) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin(),
        new ESLintPlugin({
          files: './src/**/*.{js,ts,tsx}',
          cache: true,
          threads: true,
        })
      );
    }
    // https://github.com/firebase/firebase-admin-node/issues/84
    config.externals.push('firebase-admin');
    return config;
  },
};

/**
 * Automatically generates a SW file with fetch listener, basic caching, etc.
 * No need to create our own sw.js file. All default options work fine.
 */
const withPWA = nextPWA({
  disable: isDev,
  dest: 'public',
});

export default withPWA(nextConfig);
