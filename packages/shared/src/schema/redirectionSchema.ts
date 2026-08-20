import { z } from 'zod/mini';

export const RedirectionSchema = z.object({
  alias: z.string(),
  website: z.string(),
  isDefault: z.boolean(),
});

export const RedirectionsSchema = z.array(RedirectionSchema);

export type IRedirection = z.infer<typeof RedirectionSchema>;

export type IRedirections = z.infer<typeof RedirectionsSchema>;
