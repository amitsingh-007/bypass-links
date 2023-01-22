import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import { getEnvVars } from './src/constants/env';

dotenv.config();

const { VERCEL_ENV } = getEnvVars();

const isDev = VERCEL_ENV === 'development';

export default defineConfig({
  define: {
    PROD_ENV: !isDev,
  },
  test: {
    setupFiles: ['dotenv/config'],
  },
});
