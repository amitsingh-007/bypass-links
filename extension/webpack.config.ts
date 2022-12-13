import 'webpack-dev-server'; //Required for TS typings
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';
import MergeJsonWebpackPlugin from 'merge-jsons-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import { Configuration, DefinePlugin, optimize } from 'webpack';
import { resolve } from 'path';
import {
  getFileNameFromVersion,
  getExtVersion,
} from '../common/src/utils/extensionFile';

const PATHS = {
  COMMON: resolve(__dirname, '..', 'common'),
  EXTENSION: resolve(__dirname, 'build'),
  SRC: resolve(__dirname, 'src'),
  ROOT: resolve(__dirname),
};

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? 'tsconfig.production.json' : 'tsconfig.json'
}`;

const config: Configuration = {
  mode: ENV,
  name: 'extension',
  entry: {
    content: {
      import: './src/index.tsx',
      filename: 'js/[name].[chunkhash:9].js',
    },
    background: {
      import: './src/BackgroundScript/index.ts',
      filename: 'js/[name].js',
    },
    firebase_common: {
      import: './src/helpers/firebase',
      filename: 'js/[name].js',
    },
  },
  output: {
    path: PATHS.EXTENSION,
    clean: true,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
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
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
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
              ...(!isProduction && {
                getCustomTransformers: () => ({
                  before: [ReactRefreshTypeScript()],
                }),
              }),
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
  watchOptions: {
    ignored: 'node_modules/**',
  },
  plugins: [
    new CleanWebpackPlugin(),
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
    new optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
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
          from: `${PATHS.SRC}/BackgroundScript/service-worker.js`,
          to: PATHS.EXTENSION,
        },
      ],
    }),
    new MergeJsonWebpackPlugin({
      output: {
        groupBy: [
          {
            pattern: `public/manifest${isProduction ? '*' : ''}.json`,
            fileName: 'manifest.json',
          },
        ],
      },
      globOptions: {
        root: PATHS.ROOT,
      },
    }),
    !isProduction && new ReactRefreshWebpackPlugin(),
    isProduction &&
      new FileManagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                source: PATHS.EXTENSION,
                destination: `${PATHS.EXTENSION}/${getFileNameFromVersion(
                  getExtVersion()
                )}`,
                format: 'zip',
                options: {
                  zlib: {
                    level: 9,
                  },
                  globOptions: {
                    dot: true,
                    ignore: ['*.zip'], //ignore the output .zip file
                  },
                },
              },
            ],
          },
        },
      }),
  ].filter(Boolean),
};

export default config;
