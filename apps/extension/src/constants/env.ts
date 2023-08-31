import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: '',
  server: {
    NODE_ENV: z.literal('development').or(z.literal('production')),
    HOST_NAME: z.string(),
  },
  client: {
    HOST_NAME: z.string(),
  },
  runtimeEnv: process.env,
});
