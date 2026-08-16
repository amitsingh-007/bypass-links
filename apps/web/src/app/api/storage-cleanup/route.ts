import { cleanupStorage } from '@bypass/trpc';
import { type NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@app/constants/env/server';
import { verifyInternalToken } from '@app/helpers/verifyInternalToken';

export async function POST(req: NextRequest) {
  const auth = verifyInternalToken(req);
  if (!auth.ok) {
    return new NextResponse(auth.message, { status: auth.status });
  }

  const testUserId = serverEnv.FIREBASE_TEST_USER_ID;
  if (!testUserId) {
    return NextResponse.json(
      { error: 'FIREBASE_TEST_USER_ID not configured' },
      { status: 500 }
    );
  }

  await cleanupStorage(testUserId);

  return NextResponse.json({
    status: 'Cleanup successful',
  });
}
