/* eslint-disable @typescript-eslint/no-var-requires */
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin, optimize } = require('webpack');
const { resolve } = require('path');
const {
  getExtVersion,
  getFileNameFromVersion,
} = require('../../packages/shared/src/utils/extensionFile');

const PATHS = {
  ROOT: resolve(__dirname),
  SRC: resolve(__dirname, 'src'),
  EXTENSION: resolve(__dirname, 'build'),
};

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? 'tsconfig.production.json' : 'tsconfig.json'
}`;

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  mode: ENV,
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
    //Preact doesnt support hmr, so disable it for dev
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
    nodeEnv: ENV,
    chunkIds: 'named',
    minimize: isProduction,
    runtimeChunk: 'single',
    usedExports: true,
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common_chunk',
          //Include all entries to create a common chunk
          chunks: 'all',
          //If all entries(2 for content and bg) use a code, then it to common chunk
          minChunks: 2,
          //Always include common code in common chunk
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
    new ESLintPlugin({
      files: './src/**/*.{js,ts,tsx}',
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

module.exports = config;
