/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { DllReferencePlugin } = require('webpack');
const commonConfig = require('./common.config');
const { PATHS } = require('./constants');

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

const dllReferenceWebpackPlugin = new DllReferencePlugin({
  context: PATHS.ROOT,
  manifest: `${PATHS.FIREBASE}/manifest.json`,
});

const backgroundConfig = merge(commonConfig, {
  name: 'background-script',
  entry: './src/BackgroundScript/index.ts',
  output: {
    path: PATHS.EXTENSION,
    filename: 'js/background.js',
  },
  plugins: [
    dllReferenceWebpackPlugin,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${PATHS.SRC}/BackgroundScript/service-worker.js`,
          to: PATHS.EXTENSION,
        },
      ],
    }),
  ],
});

const popupConfig = merge(commonConfig, {
  name: 'content-script',
  entry: './src/index.tsx',
  output: {
    path: PATHS.EXTENSION,
    filename: 'js/[name].[chunkhash:9].js',
    chunkFilename: 'js/[name].[chunkhash:9].js',
  },
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  plugins: [
    !isProduction && new ReactRefreshWebpackPlugin(),
    dllReferenceWebpackPlugin,
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${PATHS.ROOT}/assets`,
          to: `${PATHS.EXTENSION}/assets`,
        },
        {
          context: `${PATHS.ROOT}/public`,
          from: '**/*',
          globOptions: {
            ignore: ['**/*.html'],
          },
        },
      ],
    }),
  ].filter(Boolean),
});

module.exports = [backgroundConfig, popupConfig];
