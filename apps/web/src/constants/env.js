const { z } = require('zod');

const envVariables = z.object({
  FIREBASE_BACKUP_CRON_JOB_API_KEY: z.string(),
  HOST_NAME: z.string(),
  VERCEL_ENV: z
    .literal('development')
    .or(z.literal('preview'))
    .or(z.literal('production')),
  VERCEL_URL: z.string().optional(),
  PORT: z.string().optional(),
});

const verifyEnvVars = () => envVariables.parse(process.env);

module.exports = {
  verifyEnvVars,
};
