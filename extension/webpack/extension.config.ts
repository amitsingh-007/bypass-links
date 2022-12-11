import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { Configuration, DllReferencePlugin } from 'webpack';
import commonConfig from './common.config';
import { PATHS } from './constants';
import 'webpack-dev-server'; //Required for TS typings

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

const dllReferenceWebpackPlugin = new DllReferencePlugin({
  context: PATHS.ROOT,
  manifest: `${PATHS.FIREBASE}/manifest.json`,
});

const backgroundConfig = merge<Configuration>(commonConfig, {
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

const popupConfig = merge<Configuration>(commonConfig, {
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

export default [backgroundConfig, popupConfig];
