import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  reactCompiler: true,
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error'] },
  },
  transpilePackages: ['@bypass/shared', '@bypass/trpc', '@bypass/ui'],
  // Next auto-generates per-app AGENTS.md/CLAUDE.md; this repo keeps one at root.
  agentRules: false,
  experimental: {
    // TODO: TS 7's native package drops the JS compiler API Next's default backend
    // uses, and Next never selects the CLI checker itself, so this is required.
    // Remove when it leaves experimental: https://github.com/vercel/next.js/discussions/95633
    useTypeScriptCli: true,
  },
  // Same-origin proxy for Firebase's auth handler so signInWithRedirect isn't
  // blocked by Safari ITP. Must be a rewrite (transparent), not a 302.
  // https://firebase.google.com/docs/auth/web/redirect-best-practices
  async rewrites() {
    // Same discriminator the runtime config uses, so dev doesn't proxy to prod
    const authHelper = getFirebaseAuthHelperUrl(
      process.env.NODE_ENV === 'production'
    );
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
