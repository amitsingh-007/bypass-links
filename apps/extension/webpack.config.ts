import {
  getExtVersion,
  getFileNameFromVersion,
} from '@bypass/configs/manifest/extensionFile.js';
import PreactRefreshPlugin from '@prefresh/webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// import ESLintPlugin from 'eslint-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MergeJsonWebpackPlugin from 'merge-jsons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { resolve } from 'path';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack, { Configuration, RuleSetRule } from 'webpack';
import 'webpack-dev-server';
import { env } from './src/constants/env.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { DefinePlugin, optimize } = webpack;

const PATHS = {
  ROOT: resolve(__dirname),
  SRC: resolve(__dirname, 'src'),
  EXTENSION: resolve(__dirname, 'build'),
};

const { NODE_ENV, HOST_NAME } = env;

const isProduction = NODE_ENV === 'production';

const getCssLoaders = (cssModules: boolean): RuleSetRule['use'] => [
  isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      esModule: false,
      modules: cssModules
        ? {
            localIdentName: isProduction
              ? '[hash:base64]'
              : '[name]__[local]--[hash:base64:5]',
          }
        : false,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        config: `${PATHS.ROOT}/postcss.config.mjs`,
      },
    },
  },
];

const tsConfigFile = `${PATHS.ROOT}/${
  isProduction ? 'tsconfig.production.json' : 'tsconfig.json'
}`;

const config: Configuration = {
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
    pathinfo: false,
  },
  devServer: {
    hot: !isProduction,
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
    extensions: ['.ts', '.tsx', '.js', '.css'],
    modules: [PATHS.SRC, 'node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile,
        extensions: ['.ts', '.tsx', '.js', '.css'],
      }),
    ],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      wouter: 'wouter-preact',
    },
  },
  stats: isProduction ? 'normal' : 'errors-warnings',
  devtool: isProduction ? undefined : 'inline-source-map',
  target: 'browserslist',
  performance: {
    hints: false,
  },
  optimization: {
    nodeEnv: NODE_ENV,
    chunkIds: 'named',
    minimize: isProduction,
    sideEffects: true,
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
          mangle: true,
          compress: {
            passes: 3,
            unused: true,
            dead_code: true,
          },
          format: {
            comments: !isProduction,
          },
        },
        extractComments: false,
      }),
      isProduction && new CssMinimizerPlugin(),
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
              onlyCompileBundledFiles: true,
              configFile: tsConfigFile,
              transpileOnly: true,
              ...(!isProduction && {
                getCustomTransformers: () => ({
                  before: [
                    !isProduction && ReactRefreshTypeScript(),
                  ].filter(Boolean),
                }),
              }),
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        exclude: /\.module\.css$/i,
        use: getCssLoaders(false),
      },
      {
        test: /\.module\.css$/i,
        use: getCssLoaders(true),
      },
    ],
  },
  watchOptions: {
    ignored: ['node_modules/**', '**/*.json'],
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
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
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
            pattern: `../../packages/configs/manifest/manifest${
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
    !isProduction && new PreactRefreshPlugin(),
    // isProduction &&
    //   new ESLintPlugin({
    //     files: './src/**/*.{js,ts,tsx}',
    //     cache: false,
    //     threads: false,
    //   }),
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
  ],
};

export default config;
