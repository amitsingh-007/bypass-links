import { z } from 'zod';
import {
  RedirectionSchema,
  RedirectionsSchema,
} from '../schema/redirectionSchema';

export type IRedirection = z.infer<typeof RedirectionSchema>;

export type IRedirections = z.infer<typeof RedirectionsSchema>;
