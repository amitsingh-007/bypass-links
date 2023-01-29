/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    // const detectedIp = requestIp.getClientIp(req);
    // console.log('ip', detectedIp);
    // // @ts-ignore
    // const forwarded = req.headers['x-forwarded-for'];
    // console.log('forwarded', forwarded);
    // // @ts-ignore
    // console.log('remoteAddress', req?.socket?.remoteAddress);
    // console.log('headers', req.headers);
    // const compIp =
    //   typeof forwarded === 'string'
    //     ? forwarded.split(/, /)[0]
    //     : // @ts-ignore
    //       req?.socket?.remoteAddress;
    // console.log('compIp', compIp);
    const { geo, nextUrl } = req;
    nextUrl.searchParams.set('country', geo?.country ?? 'IN');
    // nextUrl.searchParams.set('ip', detectedIp ?? '');
    // // @ts-ignore
    // nextUrl.searchParams.set('remoteAddress', req?.socket?.remoteAddress ?? '');
    // nextUrl.searchParams.set(
    //   'forwarded',
    //   typeof forwarded === 'string' ? forwarded : ''
    // );
    return NextResponse.rewrite(nextUrl);
  }
  return NextResponse.next();
}
