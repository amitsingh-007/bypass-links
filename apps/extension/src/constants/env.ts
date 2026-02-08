import process from 'node:process';
import path from 'node:path';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/mini';

const monorepoRoot = path.dirname(path.dirname(process.cwd()));
process.loadEnvFile?.(path.join(monorepoRoot, '.env'));

export const env = createEnv({
  server: {
    HOST_NAME: z.string(),
  },
  runtimeEnv: process.env,
});
