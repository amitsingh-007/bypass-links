import process from 'node:process';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/mini';

export const env = createEnv({
  server: {
    FIREBASE_SERVICE_ACCOUNT: z.string(),
    GITHUB_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
