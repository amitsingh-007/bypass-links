import { z } from 'zod/mini';

export const PersonSchema = z.object({
  uid: z.string(),
  name: z.string(),
});

export const PersonsSchema = z.record(z.string(), PersonSchema);
