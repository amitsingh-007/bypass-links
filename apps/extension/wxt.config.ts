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

// React Compiler mis-optimizes the Persons image-crop flow (react-avatar-editor
// + nested base-ui dialogs), leaving the "Upload Image" dialog stuck open on
// save — see issue #4061. Exclude that subtree from compilation; the compiler
// stays enabled for the rest of the extension.
const reactCompiler = reactCompilerPreset();
reactCompiler.rolldown.filter = {
  ...reactCompiler.rolldown.filter,
  id: { exclude: [/\/PersonsPanel\//] },
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
