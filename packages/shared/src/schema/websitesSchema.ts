import { z } from 'zod/mini';

export const WebsitesSchema = z.object({
  FORUM_1: z.string(),
  FORUM_2: z.string(),
  FORUM_3: z.string(),
  FORUM_4: z.string(),
});
