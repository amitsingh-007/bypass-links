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
  // Next 16.3 auto-generates apps/web/AGENTS.md + CLAUDE.md; the repo maintains a
  // single root AGENTS.md, so disable the per-app generation.
  agentRules: false,
  experimental: {
    // TODO: TypeScript 7's native package drops the JS compiler API that Next's
    // default backend uses; this runs the local `tsc` (via tsc --showConfig)
    // for type info + tsconfig paths instead. Requires Next >= 16.3.
    useTypeScriptCli: true,
  },
  // Same-origin proxy for Firebase's auth handler so signInWithRedirect isn't
  // blocked by Safari ITP. Must be a rewrite (transparent), not a 302.
  // https://firebase.google.com/docs/auth/web/redirect-best-practices
  async rewrites() {
    const authHelper = 'https://bypass-links.firebaseapp.com';
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
