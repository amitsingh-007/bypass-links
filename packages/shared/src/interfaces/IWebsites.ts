import { type z } from 'zod/mini';
import { type WebsitesSchema } from '../schema/websitesSchema';

export type IWebsites = z.infer<typeof WebsitesSchema>;
