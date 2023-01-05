import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config();
const isDev = process.env.VERCEL_ENV === 'development';

export default defineConfig({
  define: {
    __PROD__: !isDev,
  },
  test: {
    setupFiles: ['dotenv/config'],
  },
});
