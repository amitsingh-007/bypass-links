import process from 'node:process';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

delete process.env.NODE_ENV;
const projectRoot = path.dirname(path.dirname(process.cwd()));
process.loadEnvFile(path.join(projectRoot, '.env'));
const { env } = await import('./src/constants/env');

const isDev = env.NODE_ENV === 'development';

export default defineConfig({
  define: {
    'process.env.NEXT_PUBLIC_PROD_ENV': JSON.stringify(!isDev),
  },
  test: {
    testTimeout: 30_000,
  },
});
