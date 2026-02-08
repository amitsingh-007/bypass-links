import { createEnv } from '@t3-oss/env-core';
import { wxt } from '@t3-oss/env-core/presets-zod';
import { z } from 'zod/mini';

export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_HOST_NAME: z.string(),
  },
  runtimeEnv: import.meta.env,
  extends: [wxt()],
});
