import { type z } from 'zod/mini';
import { type LastVisitedSchema } from '../schema/lastVisitedSchema';

export type ILastVisited = z.infer<typeof LastVisitedSchema>;
