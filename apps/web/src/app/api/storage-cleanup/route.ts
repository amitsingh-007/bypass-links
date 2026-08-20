import { cleanupStorage } from '@bypass/trpc';
import { type NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@app/constants/env/server';
import { verifyInternalToken } from '@app/helpers/verifyInternalToken';

export async function POST(req: NextRequest) {
  verifyInternalToken(req);

  await cleanupStorage(serverEnv.FIREBASE_TEST_USER_ID);

  return NextResponse.json({
    status: 'Cleanup successful',
  });
}
