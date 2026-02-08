import path from 'node:path';
import { fileURLToPath } from 'node:url';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'wxt';
import { devManifest, prodOAuth2 } from './src/constants/manifest';

const envDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

export default defineConfig({
  srcDir: 'src',
  browser: 'chrome',
  manifestVersion: 3,
  dev: {
    server: { port: 3001 },
  },
  zip: {
    artifactTemplate: 'chrome-bypass-links-{{version}}.zip',
  },
  manifest: ({ mode }) => ({
    ...devManifest,
    ...(mode === 'production' && { oauth2: prodOAuth2 }),
  }),
  vite() {
    return {
      envDir,
      envPrefix: 'NEXT_PUBLIC_',
      plugins: [tsconfigPaths(), preact()],
      build: { target: 'esnext' },
      resolve: {
        alias: { wouter: 'wouter-preact' },
      },
    };
  },
});
