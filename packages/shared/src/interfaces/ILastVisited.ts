import { type z } from 'zod';
import { type LastVisitedSchema } from '../schema/lastVisitedSchema';

export type ILastVisited = z.infer<typeof LastVisitedSchema>;
