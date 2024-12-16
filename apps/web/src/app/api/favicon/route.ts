'use cache';

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cacheLife as cacheLife } from 'next/cache';

const getFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

export async function GET(req: NextRequest) {
  cacheLife('weeks');

  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('URL not found', { status: 400 });
  }
  const response = await fetch(getFaviconUrl(url));
  const imageBlob = await response.blob();
  const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

  return new Response(imageBuffer, {
    headers: {
      'content-type': response.headers.get('content-type') ?? 'image',
    },
  });
}
