import { z } from 'zod/mini';

export const serverEnv = z
  .object({
    FIREBASE_CRON_JOB_API_KEY: z.string().check(z.minLength(1)),
    FIREBASE_TEST_USER_ID: z.string().check(z.minLength(1)),
  })
  .parse(process.env);
