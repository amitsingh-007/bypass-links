import { verifyInternalToken } from '@app/helpers/verifyInternalToken';
import { cleanupStorage } from '@bypass/trpc';
import { serverEnv } from '@app/constants/env/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  verifyInternalToken(req);

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
