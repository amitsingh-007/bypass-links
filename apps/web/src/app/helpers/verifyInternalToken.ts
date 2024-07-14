import { serverEnv } from '@app/constants/env/server.mjs';
import { NextRequest } from 'next/server';

export const verifyInternalToken = async (req: NextRequest) => {
  const bearerToken = req.headers.get('Authorization');
  const internalToken = bearerToken?.split('Bearer ')?.[1];
  if (internalToken !== serverEnv.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    throw new Error('Forbidden invocation');
  }
};
