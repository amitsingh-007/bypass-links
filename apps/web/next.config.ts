import process from 'node:process';
import path from 'node:path';
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
  env: {
    NEXT_PUBLIC_PROD_ENV: JSON.stringify(!isDev),
    NEXT_PUBLIC_HOST_NAME: process.env.HOST_NAME,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
