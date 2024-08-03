import { z } from 'zod';

export const PersonSchema = z.object({
  uid: z.string(),
  name: z.string(),
  taggedUrls: z.array(z.string()).default([]),
});

export const PersonsSchema = z.record(PersonSchema);
