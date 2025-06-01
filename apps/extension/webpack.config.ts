import PreactRefreshPlugin from '@prefresh/webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MergeJsonWebpackPlugin from 'merge-jsons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { fileURLToPath } from 'node:url';
import webpack, { Configuration, RuleSetRule } from 'webpack';
import * as lightningcss from 'lightningcss';
import browserslist from 'browserslist';
import 'webpack-dev-server';
import { env } from './src/constants/env.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const { DefinePlugin, optimize } = webpack;

const { NODE_ENV, HOST_NAME, EXT_BROWSER } = env;
const isChromeBuild = EXT_BROWSER === 'chrome';
const isProduction = NODE_ENV === 'production';

const PATHS = {
  MONOREPO_ROOT: path.resolve(dirName, '..', '..'),
  ROOT: path.resolve(dirName),
  SRC: path.resolve(dirName, 'src'),
  EXTENSION: isChromeBuild
    ? path.resolve(dirName, 'chrome-build')
    : path.resolve(dirName, 'firefox-build'),
};

const getManifestFilesToMerge = () => {
  const basePath = '../../packages/configs/manifest';
  const files = [
    `${basePath}/manifest.base.json`,
    `${basePath}/manifest.${EXT_BROWSER}.json`,
  ];
  if (isProduction) {
    files.push(`${basePath}/manifest.${EXT_BROWSER}.prod.json`);
  }
  return `{${files.join(',')}}`;
};

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
  target: 'browserslist:defaults',
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
      isProduction &&
        new CssMinimizerPlugin({
          minify: CssMinimizerPlugin.lightningCssMinify,
          minimizerOptions: {
            // @ts-expect-error lightningcss expects targets
            targets: lightningcss.browserslistToTargets(
              browserslist('defaults')
            ),
          },
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
              onlyCompileBundledFiles: true,
              configFile: tsConfigFile,
              transpileOnly: true,
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
      IS_CHROME: JSON.stringify(isChromeBuild),
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
          from: isChromeBuild
            ? `${PATHS.SRC}/BackgroundScript/chrome-service-worker.js`
            : `${PATHS.SRC}/BackgroundScript/firefox-bg-script.js`,
          to: `${PATHS.EXTENSION}/service-worker.js`,
        },
      ],
    }),
    new MergeJsonWebpackPlugin({
      output: {
        groupBy: [
          {
            pattern: getManifestFilesToMerge(),
            fileName: 'manifest.json',
          },
        ],
      },
      globOptions: {
        root: PATHS.ROOT,
      },
    }),
    // !isProduction && new PreactRefreshPlugin(),
    // new ESLintPlugin({
    //   extensions: ['ts', 'tsx'],
    //   threads: true,
    //   emitWarning: false,
    //   eslintPath: path.resolve(PATHS.MONOREPO_ROOT, 'node_modules/eslint'),
    // }),
  ],
};

export default config;
