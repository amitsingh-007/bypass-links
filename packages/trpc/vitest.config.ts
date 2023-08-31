import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import { getEnv } from './src/constants/env';

dotenv.config();

const { VERCEL_ENV } = getEnv();

const isDev = VERCEL_ENV === 'development';

export default defineConfig({
  define: {
    PROD_ENV: !isDev,
  },
  test: {
    setupFiles: ['dotenv/config'],
  },
});
