import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    const { geo, nextUrl } = req;
    nextUrl.searchParams.set('country', geo?.country ?? 'IN');
    return NextResponse.rewrite(nextUrl);
  }
  return NextResponse.next();
}
