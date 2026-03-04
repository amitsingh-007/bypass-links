import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from '@t3-oss/env-core';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'wxt';
import { z } from 'zod/mini';
import { devManifest, prodOAuth2 } from './src/constants/manifest';

const envDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

const validateBuildEnv = (mode: string) => {
  createEnv({
    server: {
      NEXT_PUBLIC_HOST_NAME: z.string(),
    },
    runtimeEnv: {
      ...process.env,
      ...loadEnv(mode, envDir, 'NEXT_PUBLIC_'),
    },
  });
};

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
  vite({ mode }) {
    validateBuildEnv(mode);

    return {
      envDir,
      envPrefix: 'NEXT_PUBLIC_',
      plugins: [tsconfigPaths(), preact(), tailwindcss()],
      build: { target: 'esnext' },
      resolve: {
        alias: { wouter: 'wouter-preact' },
      },
    };
  },
});
