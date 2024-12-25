import { z } from 'zod';
import { WebsitesSchema } from '../schema/websitesSchema';

export type IWebsites = z.infer<typeof WebsitesSchema>;
