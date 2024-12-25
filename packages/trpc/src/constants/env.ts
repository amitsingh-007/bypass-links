import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const getEnv = () =>
  createEnv({
    server: {
      VERCEL_ENV: z.enum(['development', 'preview', 'production']),
      SERVICE_ACCOUNT_KEY: z.string(),
      FIREBASE_PRIVATE_KEY: z.string(),
      GITHUB_TOKEN: z.string(),
    },
    runtimeEnv: process.env,
  });
