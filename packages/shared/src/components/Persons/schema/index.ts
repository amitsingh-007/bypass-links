import { z } from 'zod/mini';

import { NameEncodingSchema } from '../../../schema/nameEncodingSchema';

export const PersonSchema = z.object({
  uid: z.string(),
  name: z.string(),
  nameEncoding: z.optional(NameEncodingSchema),
});

export const PersonsSchema = z.record(z.string(), PersonSchema);

export const PersonImageUrlsSchema = z.record(z.string(), z.string());
