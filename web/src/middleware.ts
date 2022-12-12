import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest, res: NextResponse) {
  if (req.nextUrl.pathname === '/') {
    console.log(req.geo);
  }
}
