import { z } from 'zod';

export const PersonSchema = z.object({
  uid: z.string(),
  name: z.string(),
});

export const PersonsSchema = z.record(PersonSchema);
