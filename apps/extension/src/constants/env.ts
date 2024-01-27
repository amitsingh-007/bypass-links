import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']),
    HOST_NAME: z.string(),
  },
  runtimeEnv: process.env,
});
