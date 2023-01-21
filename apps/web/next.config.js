const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const nextPWA = require('next-pwa');
const { verifyEnvVars } = require('./src/constants/env');

verifyEnvVars();

const isDev = process.env.VERCEL_ENV === 'development';
process.env['NODE_ENV'] = 'development';

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
        __PROD__: JSON.stringify(!dev),
        HOST_NAME: JSON.stringify(process.env.HOST_NAME),
      })
    );
    if (dev) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin(),
        new ESLintPlugin({
          files: './src/**/*.{js,ts,tsx}',
          cache: true,
        })
      );
    }
    // https://github.com/firebase/firebase-admin-node/issues/84
    config.externals.push('firebase-admin');
    config.mode = 'development';
    config.optimization.nodeEnv = 'development';
    config.optimization.minimize = false;
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

module.exports = withPWA(nextConfig);
