import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/mini';

export const serverEnv = createEnv({
  server: {
    FIREBASE_CRON_JOB_API_KEY: z.string(),
    FIREBASE_TEST_USER_ID: z.string(),
    VERCEL_URL: z.optional(z.string()),
    PORT: z.optional(z.string()),
  },
  runtimeEnv: {
    FIREBASE_CRON_JOB_API_KEY: process.env.FIREBASE_CRON_JOB_API_KEY,
    FIREBASE_TEST_USER_ID: process.env.FIREBASE_TEST_USER_ID,
    VERCEL_URL: process.env.VERCEL_URL,
    PORT: process.env.PORT,
  },
});
