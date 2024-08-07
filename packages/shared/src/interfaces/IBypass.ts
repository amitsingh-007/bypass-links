import { z } from 'zod';
import { BypassSchema } from '../schema/bypassSchema';

export type IBypass = z.infer<typeof BypassSchema>;
