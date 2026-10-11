import { z } from 'zod/mini';

export const RedirectionSchema = z.object({
  id: z.uuid(),
  alias: z.string(),
  website: z.string(),
  isDefault: z.boolean(),
});

export const RedirectionsSchema = z
  .array(RedirectionSchema)
  .check(
    z.refine(
      (rules) => new Set(rules.map(({ id }) => id)).size === rules.length,
      { message: 'Duplicate redirection IDs' }
    )
  );

export type IRedirection = z.infer<typeof RedirectionSchema>;

export type IRedirections = z.infer<typeof RedirectionsSchema>;
