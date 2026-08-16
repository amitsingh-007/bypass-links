import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { IS_PROD } from '@bypass/configs/env';
import { getFirebaseAuthHelperUrl } from '@bypass/configs/firebase.config';
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
  // Next 16.3 auto-generates apps/web/AGENTS.md + CLAUDE.md; the repo maintains a
  // single root AGENTS.md, so disable the per-app generation.
  agentRules: false,
  experimental: {
    // TODO: TypeScript 7's native package drops the JS compiler API that Next's
    // default backend uses; this runs the local `tsc` (via tsc --showConfig) for
    // type info + tsconfig paths instead. Next never selects the CLI checker on
    // its own, so this is required, not optional. Remove once it leaves experimental.
    // Tracking: https://github.com/vercel/next.js/discussions/95633
    useTypeScriptCli: true,
  },
  // Same-origin proxy for Firebase's auth handler so signInWithRedirect isn't
  // blocked by Safari ITP. Must be a rewrite (transparent), not a 302.
  // https://firebase.google.com/docs/auth/web/redirect-best-practices
  async rewrites() {
    // Same discriminator the runtime config uses, so dev doesn't proxy to prod
    const authHelper = getFirebaseAuthHelperUrl(IS_PROD);
    return [
      {
        source: '/__/auth/:path*',
        destination: `${authHelper}/__/auth/:path*`,
      },
      {
        source: '/__/firebase/:path*',
        destination: `${authHelper}/__/firebase/:path*`,
      },
    ];
  },
};

export default nextConfig;
