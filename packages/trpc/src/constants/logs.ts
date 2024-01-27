import { z } from 'zod';

export const axiomDataset = 'all-logs';

export const logRequestSchema = z.object({
  app: z.enum(['extension', 'web']),
  isProd: z.boolean(),
  level: z.enum(['info', 'error']),
  url: z.string(),
  tabUrl: z.string().optional(),
  message: z.any(),
  metaData: z.any(),
});

export type ILogRequest = z.infer<typeof logRequestSchema>;

export interface ILogData extends Omit<ILogRequest, 'isProd'> {
  env: 'development' | 'production';
  req: {
    ip: string | null;
    userAgent?: string;
  };
}
