import process from 'node:process';
import path from 'node:path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { type NextConfig } from 'next';

// Load root .env only if not running on Vercel
if (!process.env.VERCEL) {
  const projectRoot = path.dirname(path.dirname(process.cwd()));
  process.loadEnvFile(path.join(projectRoot, '.env'));
}
import('./src/app/constants/env/server.ts');

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  cacheComponents: true,
  reactStrictMode: true,
  reactCompiler: true,
  experimental: {
    // https://mantine.dev/guides/next/#app-router-tree-shaking
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  transpilePackages: ['@bypass/shared', '@bypass/trpc'],
  // TODO: migrate to turbopack
  webpack(config, { dev, webpack }) {
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
      config.plugins.push(new ForkTsCheckerWebpackPlugin());
    }
    return config;
  },
};

export default nextConfig;
