import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/mini';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_HOST_NAME: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME,
  },
});
