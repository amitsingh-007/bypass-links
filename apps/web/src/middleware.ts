/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// @ts-ignore
import requestIp from 'request-ip';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    const detectedIp = requestIp.getClientIp(req);
    console.log('ip', detectedIp);
    // @ts-ignore
    // const forwarded = req.headers['x-forwarded-for'];
    // const ip =
    //   typeof forwarded === 'string'
    //     ? forwarded.split(/, /)[0]
    //     : req.socket.remoteAddress;
    // console.log('ip', { ip });
    const { geo, nextUrl } = req;
    nextUrl.searchParams.set('country', geo?.country ?? 'IN');
    return NextResponse.rewrite(nextUrl);
  }
  return NextResponse.next();
}
