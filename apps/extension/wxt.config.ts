import path from 'node:path';
import { fileURLToPath } from 'node:url';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'wxt';

import { devManifest, prodOAuth2 } from './src/constants/manifest';

const envDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

const isCoverageBuild = process.env.COVERAGE === '1';

export default defineConfig({
  srcDir: 'src',
  browser: 'chrome',
  manifestVersion: 3,
  // Its own dir so a coverage build can never overwrite the released one,
  // regardless of the order the CI job runs the two builds in
  ...(isCoverageBuild && { outDir: '.output-coverage' }),
  dev: {
    server: { port: 3001 },
  },
  webExt: { disabled: true },
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

      plugins: [
        react(),
        babel({
          presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
      ],
      build: {
        target: 'esnext',
        modulePreload: false,
        ...(isCoverageBuild && { sourcemap: true, minify: false }),
      },
      resolve: {
        tsconfigPaths: true,
      },
    };
  },
});
