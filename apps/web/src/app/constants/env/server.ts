import process from 'process';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/mini';

export const serverEnv = createEnv({
  server: {
    FIREBASE_CRON_JOB_API_KEY: z.string(),
    FIREBASE_TEST_USER_ID: z.string(),
    HOST_NAME: z.string(),
    VERCEL_URL: z.optional(z.string()),
    PORT: z.optional(z.string()),
  },
  experimental__runtimeEnv: {
    HOST_NAME: process.env.HOST_NAME,
    VERCEL_URL: process.env.VERCEL_URL,
    PORT: process.env.PORT,
  },
});
