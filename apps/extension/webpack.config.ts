import { getExtVersion, getFileNameFromVersion } from '@bypass/shared';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MergeJsonWebpackPlugin from 'merge-jsons-webpack-plugin';
import { resolve } from 'path';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin, optimize } from 'webpack';
import 'webpack-dev-server'; // Required for TS typings
import { env } from './src/constants/env';

const PATHS = {
  ROOT: resolve(__dirname),
  SRC: resolve(__dirname, 'src'),
  EXTENSION: resolve(__dirname, 'build'),
};

const { NODE_ENV, HOST_NAME } = env;

const isProduction = NODE_ENV === 'production';

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? 'tsconfig.production.json' : 'tsconfig.json'
}`;

const config = {
  mode: NODE_ENV,
  name: 'extension',
  entry: {
    content_script: {
      import: './src/index.tsx',
      filename: 'js/content.js',
    },
    background_script: {
      import: './src/BackgroundScript/index.ts',
      filename: 'js/background.js',
    },
  },
  output: {
    path: PATHS.EXTENSION,
    clean: true,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    asyncChunks: false,
  },
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      logging: 'warn',
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [PATHS.SRC, 'node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile,
        extensions: ['.ts', '.tsx', '.js'],
      }),
    ],
    // Preact doesn't support hmr, so disable it for dev
    alias: isProduction
      ? {
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
        }
      : undefined,
  },
  stats: isProduction ? 'normal' : 'errors-warnings',
  devtool: isProduction ? undefined : 'inline-source-map',
  target: 'browserslist',
  performance: {
    hints: isProduction ? undefined : false,
  },
  optimization: {
    nodeEnv: NODE_ENV,
    chunkIds: 'named',
    minimize: isProduction,
    runtimeChunk: 'single',
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common_chunk',
          // Include all entries to create a common chunk
          chunks: 'all',
          // If all entries(2 for content and bg) use a code, then include it to common chunk
          minChunks: 2,
          // Always include common code in common chunk
          enforceSizeThreshold: 0,
        },
      },
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
                  before: [!isProduction && ReactRefreshTypeScript()].filter(
                    Boolean
                  ),
                }),
              }),
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
    new DefinePlugin({
      PROD_ENV: JSON.stringify(isProduction),
      HOST_NAME: JSON.stringify(HOST_NAME),
    }),
    new optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      excludeChunks: ['background_script'],
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
            pattern: `../../packages/shared/src/configs/manifest${
              isProduction ? '*' : ''
            }.json`,
            fileName: 'manifest.json',
          },
        ],
      },
      globOptions: {
        root: PATHS.ROOT,
      },
    }),
    isProduction &&
      new ESLintPlugin({
        files: './src/**/*.{js,ts,tsx}',
        cache: true,
        threads: true,
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
                    ignore: ['*.zip'], // ignore the output .zip file
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
