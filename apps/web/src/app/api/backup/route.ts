import { verifyInternalToken } from '@app/helpers/verifyInternalToken';
import { backupData } from '@bypass/trpc';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  verifyInternalToken(req);

  await backupData();
  return NextResponse.json({ status: 'Firebase backup successful' });
}
