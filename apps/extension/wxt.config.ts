import path from 'node:path';
import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { devManifest, prodOAuth2 } from './src/constants/manifest';

const envDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

// Keep React Compiler off third-party node_modules. Compiling @base-ui/react
// broke its dialog close behaviour, leaving the Persons "Upload Image" dialog
// stuck open on save — see issue #4061. The compiler still runs on the
// extension's own src and the @bypass/* workspace packages (real paths).
const reactCompiler = reactCompilerPreset();
reactCompiler.rolldown.filter = {
  ...reactCompiler.rolldown.filter,
  id: { exclude: [/\/node_modules\//] },
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
  vite() {
    return {
      envDir,
      envPrefix: 'NEXT_PUBLIC_',

      plugins: [
        react(),
        babel({
          presets: [reactCompiler],
        }),
        tailwindcss(),
      ],
      build: { target: 'esnext' },
      resolve: {
        tsconfigPaths: true,
      },
    };
  },
});
