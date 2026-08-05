import { z } from 'zod/mini';

/**
 * A record rather than a fixed object: zod strips unknown keys, so enumerating
 * the forums here meant a newly added one was silently dropped at the tRPC
 * output boundary and surfaced far away as "Not a forum page".
 * Values are optional — an unsynced user legitimately has no websites record.
 */
export const WebsitesSchema = z.record(z.string(), z.optional(z.string()));
