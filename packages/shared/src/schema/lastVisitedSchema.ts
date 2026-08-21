import { z } from 'zod/mini';

export const LastVisitedSchema = z.record(z.string(), z.number());

export type ILastVisited = z.infer<typeof LastVisitedSchema>;
