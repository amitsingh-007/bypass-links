import { z } from 'zod/mini';

/**
 * Optional because a user who has not synced yet legitimately has no websites
 * record. Making them required forced a `{} as unknown as IWebsites` cast at
 * the storage fallback, which turned "not synced" into `url.includes(undefined)`
 * at the consumers.
 */
export const WebsitesSchema = z.object({
  FORUM_1: z.optional(z.string()),
  FORUM_2: z.optional(z.string()),
  FORUM_3: z.optional(z.string()),
  FORUM_4: z.optional(z.string()),
});
