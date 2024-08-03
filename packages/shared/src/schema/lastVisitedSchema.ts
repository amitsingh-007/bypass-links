import { z } from 'zod';

export const LastVisitedSchema = z.record(z.number());
