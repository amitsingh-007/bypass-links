import { z } from 'zod/mini';

export const env = z
  .object({ NEXT_PUBLIC_HOST_NAME: z.string() })
  .parse(import.meta.env);
