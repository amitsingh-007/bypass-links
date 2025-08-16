import { z } from 'zod/mini';

export const LastVisitedSchema = z.record(z.string(), z.number());
