import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/mini';

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../'
);
process.loadEnvFile?.(path.join(monorepoRoot, '.env'));

export const env = createEnv({
  server: {
    FIREBASE_SERVICE_ACCOUNT: z.string(),
    GITHUB_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
