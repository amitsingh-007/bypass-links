import process from 'node:process';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/mini';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']),
    FIREBASE_SERVICE_ACCOUNT: z.string(),
    GITHUB_TOKEN: z.string(),
    FIREBASE_TEST_USER_EMAIL: z.string(),
    FIREBASE_TEST_USER_PASSWORD: z.string(),
  },
  runtimeEnv: process.env,
});
