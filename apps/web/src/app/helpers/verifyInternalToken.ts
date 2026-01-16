import { serverEnv } from '@app/constants/env/server';
import { type NextRequest } from 'next/server';

export const verifyInternalToken = (req: NextRequest) => {
  const bearerToken = req.headers.get('Authorization');
  const internalToken = bearerToken?.split('Bearer ')?.[1];

  if (internalToken !== serverEnv.FIREBASE_CRON_JOB_API_KEY) {
    throw new Error('Forbidden invocation');
  }
};
