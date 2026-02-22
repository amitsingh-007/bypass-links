import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type NextConfig } from 'next';

if (!process.env.VERCEL) {
  const monorepoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
  );
  process.loadEnvFile(path.join(monorepoRoot, '.env'));
}

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  cacheComponents: true,
  reactStrictMode: true,
  reactCompiler: true,
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  transpilePackages: ['@bypass/shared', '@bypass/trpc', '@bypass/ui'],
};

export default nextConfig;
