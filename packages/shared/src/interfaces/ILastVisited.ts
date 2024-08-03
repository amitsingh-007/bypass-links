import { z } from 'zod';
import { LastVisitedSchema } from '../schema/lastVisitedSchema';

export type ILastVisited = z.infer<typeof LastVisitedSchema>;
