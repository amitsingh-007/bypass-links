import { z } from 'zod/mini';

// Optional: an unsynced user legitimately has no websites record
export const WebsitesSchema = z.object({
  FORUM_1: z.optional(z.string()),
  FORUM_2: z.optional(z.string()),
  FORUM_3: z.optional(z.string()),
  FORUM_4: z.optional(z.string()),
});
