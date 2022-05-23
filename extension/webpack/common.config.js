/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { PATHS } = require('./constants');

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? 'tsconfig.production.json' : 'tsconfig.json'
}`;

const commonConfig = {
  mode: ENV,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.scss'],
    modules: [PATHS.SRC, PATHS.COMMON, 'node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile,
        extensions: ['.ts', '.tsx', '.js', '.scss'],
      }),
    ],
  },
  stats: isProduction ? 'normal' : 'errors-warnings',
  devtool: isProduction ? undefined : 'inline-source-map',
  target: 'browserslist',
  performance: {
    hints: false,
  },
  optimization: {
    nodeEnv: ENV,
    chunkIds: 'named',
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: tsConfigFile,
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: tsConfigFile,
      },
    }),
    new ESLintPlugin({
      files: './src/**/*.{js,ts,tsx}',
      threads: true,
      cache: true,
    }),
    new DefinePlugin({
      __PROD__: JSON.stringify(isProduction),
      HOST_NAME: JSON.stringify(process.env.HOST_NAME),
    }),
  ],
  watchOptions: {
    ignored: 'node_modules/**',
  },
};

module.exports = commonConfig;
