import process from 'node:process';

import { loadRootEnv } from '@bypass/configs/env';
import { z } from 'zod/mini';

loadRootEnv();

export const env = z
  .object({ FIREBASE_SERVICE_ACCOUNT: z.string(), GITHUB_TOKEN: z.string() })
  .parse(process.env);
