import deepmerge from 'deepmerge';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'wxt';
import manifestDev from '../../packages/configs/manifest/manifest.json' with { type: 'json' };
import manifestProd from '../../packages/configs/manifest/manifest.prod.json' with { type: 'json' };

export default defineConfig({
  srcDir: 'src',
  browser: 'chrome',
  manifestVersion: 3,
  dev: {
    server: {
      port: 3001,
    },
  },
  zip: {
    artifactTemplate: 'chrome-bypass-links-{{version}}.zip',
  },
  manifest({ mode }) {
    return deepmerge.all([
      manifestDev,
      ...(mode === 'production' ? [manifestProd] : []),
    ]);
  },
  async vite(configEnv) {
    const { env } = await import('./src/constants/env');
    const isProduction = configEnv.mode === 'production';

    return {
      plugins: [tsconfigPaths(), preact()],
      build: {
        target: 'esnext',
      },
      resolve: {
        alias: { wouter: 'wouter-preact' },
      },
      define: {
        'process.env.NEXT_PUBLIC_PROD_ENV': JSON.stringify(
          String(isProduction)
        ),
        'process.env.NEXT_PUBLIC_HOST_NAME': JSON.stringify(env.HOST_NAME),
      },
    };
  },
});
