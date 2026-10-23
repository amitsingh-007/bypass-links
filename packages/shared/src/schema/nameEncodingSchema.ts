import { z } from 'zod/mini';

export const NameEncodingSchema = z.object({
  version: z.literal(2),
  value: z.string(),
});

export type NameEncoding = z.infer<typeof NameEncodingSchema>;
