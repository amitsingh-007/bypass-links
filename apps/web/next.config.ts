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

// TODO: The build runs via `next build --webpack` (see package.json) instead of
// the Turbopack default. Turbopack emits hash-suffixed external-module
// references that don't resolve under pnpm's symlinked node_modules on Vercel,
// so sharp's native binary fails to load in /api/upload-file (ERR_DLOPEN_FAILED)
// and the endpoint 500s. webpack traces the native module correctly.
// Tracking: https://github.com/vercel/next.js/issues/87737
// Once fixed upstream, drop `--webpack` to switch the build back to Turbopack.
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
