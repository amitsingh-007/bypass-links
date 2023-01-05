import { z } from 'zod';

export const uidType = z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid UID');
