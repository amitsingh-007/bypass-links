import { Buffer } from 'node:buffer';
import { timingSafeEqual } from 'node:crypto';

import { cleanupStorage, getAuthBearer } from '@bypass/trpc';
import { type NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@app/constants/env/server';

export async function POST(req: NextRequest) {
  const credential = Buffer.from(getAuthBearer(req) ?? '');
  const secret = Buffer.from(serverEnv.FIREBASE_CRON_JOB_API_KEY);

  if (
    credential.length !== secret.length ||
    !timingSafeEqual(credential, secret)
  ) {
    return new NextResponse('Forbidden invocation', { status: 403 });
  }

  await cleanupStorage(serverEnv.FIREBASE_TEST_USER_ID);

  return NextResponse.json({
    status: 'Cleanup successful',
  });
}
