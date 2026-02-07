import deepmerge from 'deepmerge';
import { type PluginOption } from 'vite';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'wxt';
import manifestExt from '../../packages/configs/manifest/manifest.json' assert { type: 'json' };
import manifestProd from '../../packages/configs/manifest/manifest.prod.json' assert { type: 'json' };

export default defineConfig({
  srcDir: 'src',
  browser: 'chrome',
  manifestVersion: 3,
  dev: {
    server: {
      port: 3001,
    },
  },
  manifest({ mode }) {
    return deepmerge.all([
      manifestExt,
      ...(mode === 'production' ? [manifestProd] : []),
    ]);
  },
  async vite(configEnv) {
    const { env } = await import('./src/constants/env');
    const isProduction = configEnv.mode === 'production';

    return {
      plugins: [tsconfigPaths(), preact()] as PluginOption[],
      resolve: {
        alias: {
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
          wouter: 'wouter-preact',
        },
      },
      define: {
        'process.env': JSON.stringify({
          NEXT_PUBLIC_PROD_ENV: JSON.stringify(isProduction),
          NEXT_PUBLIC_HOST_NAME: env.HOST_NAME,
        }),
      },
    };
  },
});
