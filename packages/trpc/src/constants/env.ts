import { z } from 'zod';

const envVariables = z.object({
  VERCEL_ENV: z
    .literal('development')
    .or(z.literal('preview'))
    .or(z.literal('production')),
  SERVICE_ACCOUNT_KEY: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  GITHUB_TOKEN: z.string(),
  SITE_NAME: z.string().optional(),
  AXIOM_TOKEN: z.string(),
  AXIOM_ORG_ID: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const getEnvVars = () => envVariables.parse(process.env);
