import path from 'node:path';
import { fileURLToPath } from 'node:url';
import deepmerge from 'deepmerge';
import { loadEnv, type PluginOption } from 'vite';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'wxt';
import manifestBase from '../../packages/configs/manifest/manifest.base.json' assert { type: 'json' };
import manifestChrome from '../../packages/configs/manifest/manifest.chrome.json' assert { type: 'json' };
import manifestChromeProd from '../../packages/configs/manifest/manifest.chrome.prod.json' assert { type: 'json' };

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const monorepoRoot = path.resolve(dirName, '..', '..');

const getMergedManifest = (mode: string) => {
  const isProduction = mode === 'production';
  const mergedManifest = deepmerge.all([
    manifestBase,
    manifestChrome,
    ...(isProduction ? [manifestChromeProd] : []),
  ]);

  delete (mergedManifest as { background?: unknown }).background;

  return {
    ...mergedManifest,
    action: {
      ...(mergedManifest as { action?: Record<string, unknown> }).action,
      default_popup: 'popup.html',
    },
  };
};

export default defineConfig({
  srcDir: 'src',
  browser: 'chrome',
  manifestVersion: 3,
  manifest({ mode }) {
    return getMergedManifest(mode);
  },
  vite(configEnv) {
    const env = loadEnv(configEnv.mode, monorepoRoot, '');
    const hostName = env.HOST_NAME ?? process.env.HOST_NAME ?? '';
    const isProduction = configEnv.mode === 'production';

    return {
      plugins: [tsconfigPaths(), preact()] as PluginOption[],
      resolve: {
        alias: {
          '@': path.resolve(dirName, 'src'),
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
          wouter: 'wouter-preact',
        },
      },
      define: {
        'process.env': JSON.stringify({
          NEXT_PUBLIC_PROD_ENV: JSON.stringify(isProduction),
          NEXT_PUBLIC_HOST_NAME: hostName,
          NEXT_PUBLIC_IS_CHROME: JSON.stringify(true),
        }),
      },
    };
  },
});
