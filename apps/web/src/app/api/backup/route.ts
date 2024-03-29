import { verifyInternalToken } from '@/helpers/verifyInternalToken';
import { backupData } from '@bypass/trpc';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await verifyInternalToken(req);

  await backupData();
  return NextResponse.json({ status: 'Firebase backup successful' });
}
