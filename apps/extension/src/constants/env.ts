import { z } from 'zod';

const envVariables = z.object({
  NODE_ENV: z.literal('development').or(z.literal('production')),
  HOST_NAME: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const getEnvVars = () => envVariables.parse(process.env);
