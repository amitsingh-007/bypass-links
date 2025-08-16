import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import { getEnv } from './src/constants/env';

const projectRoot = path.dirname(path.dirname(process.cwd()));
dotenv.config({ path: path.join(projectRoot, '.env') });

const { VERCEL_ENV } = getEnv();
const isDev = VERCEL_ENV === 'development';

export default defineConfig({
  define: {
    PROD_ENV: !isDev,
  },
  test: {
    testTimeout: 30_000,
  },
});
