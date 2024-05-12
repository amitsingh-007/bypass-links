import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

import('./src/constants/env/server.mjs');

const isDev = process.env.VERCEL_ENV === 'development';

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    /**
     * @link https://github.com/vercel/next.js/issues/55682#issuecomment-1739894301
     */
    serverMinification: false,
  },
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  /**
   * TODO: remove after app router migration
   * @link https://github.com/vercel/next.js/issues/30567#issuecomment-958806777
   */
  optimizeFonts: false,
  reactStrictMode: true,
  transpilePackages: ['@bypass/shared'],
  webpack: (config, { dev, isServer, webpack }) => {
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

export default nextConfig;
