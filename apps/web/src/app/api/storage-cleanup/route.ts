import { cleanupStorage, getAuthBearer } from '@bypass/trpc';
import { type NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@app/constants/env/server';

export async function POST(req: NextRequest) {
  if (getAuthBearer(req) !== serverEnv.FIREBASE_CRON_JOB_API_KEY) {
    return new NextResponse('Forbidden invocation', { status: 403 });
  }

  await cleanupStorage(serverEnv.FIREBASE_TEST_USER_ID);

  return NextResponse.json({
    status: 'Cleanup successful',
  });
}
