import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
  server: {
    FIREBASE_BACKUP_CRON_JOB_API_KEY: z.string(),
    HOST_NAME: z.string(),
    VERCEL_URL: z.string().optional(),
    PORT: z.string().optional(),
    VERCEL_ENV: z.literal('development').or(z.literal('production')),
  },
  runtimeEnv: {
    FIREBASE_BACKUP_CRON_JOB_API_KEY:
      process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY,
    HOST_NAME: process.env.HOST_NAME,
    VERCEL_URL: process.env.VERCEL_URL,
    PORT: process.env.PORT,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
});
