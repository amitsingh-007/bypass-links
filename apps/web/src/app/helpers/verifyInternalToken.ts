import { getAuthBearer } from '@bypass/trpc/appRouter';
import { type NextRequest } from 'next/server';

import { serverEnv } from '@app/constants/env/server';

/**
 * Deliberately not `AuthorizationResult`: this check has no user to hand back,
 * and reusing that type would imply the ok branch carries one.
 */
type InternalTokenResult =
  | { ok: true }
  | { ok: false; status: 403; message: string };

/**
 * Returns a result rather than throwing, matching `checkUserAuthorized` and
 * `authorizeUser`. Throwing produced an uncaught 500 with a stack, which the
 * caller could not tell apart from a genuine server misconfiguration.
 */
export const verifyInternalToken = (req: NextRequest): InternalTokenResult => {
  if (getAuthBearer(req) !== serverEnv.FIREBASE_CRON_JOB_API_KEY) {
    return { ok: false, status: 403, message: 'Forbidden invocation' };
  }
  return { ok: true };
};
