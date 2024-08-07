import { z } from 'zod';
import { PersonSchema, PersonsSchema } from '../schema';

export type IPerson = z.infer<typeof PersonSchema>;

export type IPersons = z.infer<typeof PersonsSchema>;

export type PersonImageUrls = Record<string, string>;

export interface IPersonWithImage extends IPerson {
  imageUrl: string;
}
