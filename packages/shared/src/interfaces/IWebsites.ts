import { type z } from 'zod';
import { type WebsitesSchema } from '../schema/websitesSchema';

export type IWebsites = z.infer<typeof WebsitesSchema>;
