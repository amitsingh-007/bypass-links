import process from 'node:process';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']),
    HOST_NAME: z.string(),
    EXT_BROWSER: z.enum(['chrome', 'firefox']),
  },
  runtimeEnv: process.env,
});
