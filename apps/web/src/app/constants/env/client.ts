import { z } from 'zod/mini';

// Literal process.env.X references so Next inlines them into the client bundle
export const clientEnv = z
  .object({ NEXT_PUBLIC_HOST_NAME: z.string() })
  .parse({ NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME });
