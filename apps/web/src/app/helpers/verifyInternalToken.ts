import { getAuthBearer } from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

import { serverEnv } from '@app/constants/env/server';

export const verifyInternalToken = (req: NextRequest) => {
  if (getAuthBearer(req) !== serverEnv.FIREBASE_CRON_JOB_API_KEY) {
    throw new Error('Forbidden invocation');
  }
};
