import { NextRequest, NextResponse } from 'next/server';

const getFaviconUrl = (url: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('URL not found', { status: 400 });
  }
  const response = await fetch(getFaviconUrl(url), { cache: 'no-store' });
  const imageBlob = await response.blob();
  const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

  return new Response(imageBuffer, {
    headers: {
      'content-type': response.headers.get('content-type') ?? 'image',
    },
  });
}
