import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

const projectRoot = path.dirname(path.dirname(process.cwd()));
dotenv.config({ path: path.join(projectRoot, '.env'), override: true });
const { env } = await import('./src/constants/env');

const isDev = env.NODE_ENV === 'development';

export default defineConfig({
  define: {
    PROD_ENV: !isDev,
  },
  test: {
    testTimeout: 30_000,
  },
});
