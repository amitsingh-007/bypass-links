import { getAuthBearer } from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

import { serverEnv } from '@app/constants/env/server';

/**
 * A shared secret, not a user, so it returns only the failure half of
 * AuthorizationResult — enough for routes to handle both auth styles alike.
 */
type InternalAuthResult =
  | { ok: true }
  | { ok: false; status: 403; message: string };

export const verifyInternalToken = (req: NextRequest): InternalAuthResult => {
  if (getAuthBearer(req) !== serverEnv.FIREBASE_CRON_JOB_API_KEY) {
    return { ok: false, status: 403, message: 'Forbidden invocation' };
  }
  return { ok: true };
};
