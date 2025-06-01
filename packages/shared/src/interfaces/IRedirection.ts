import { type z } from 'zod';
import {
  type RedirectionSchema,
  type RedirectionsSchema,
} from '../schema/redirectionSchema';

export type IRedirection = z.infer<typeof RedirectionSchema>;

export type IRedirections = z.infer<typeof RedirectionsSchema>;
