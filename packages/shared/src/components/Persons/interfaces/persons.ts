import { type z } from 'zod/mini';
import { type PersonSchema, type PersonsSchema } from '../schema';

export type IPerson = z.infer<typeof PersonSchema>;

export type IPersons = z.infer<typeof PersonsSchema>;

export type PersonImageUrls = Record<string, string>;

export interface IPersonWithImage extends IPerson {
  imageUrl: string;
}
