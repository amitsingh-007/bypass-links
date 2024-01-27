import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const getEnv = () =>
  createEnv({
    server: {
      VERCEL_ENV: z.enum(['development', 'preview', 'production']),
      SERVICE_ACCOUNT_KEY: z.string(),
      FIREBASE_PRIVATE_KEY: z.string(),
      GITHUB_TOKEN: z.string(),
      SITE_NAME: z.string().optional(),
      AXIOM_TOKEN: z.string(),
      AXIOM_ORG_ID: z.string(),
    },
    runtimeEnv: process.env,
  });
