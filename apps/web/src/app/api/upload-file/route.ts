import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToFirebase } from '@bypass/trpc/appRouter';
import { authorizeUser } from '@/helpers/authorizeUser';

export async function POST(request: NextRequest) {
  const user = await authorizeUser(request);

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file !== 'object') {
    return new NextResponse('No image found to upload', { status: 400 });
  }

  await uploadImageToFirebase(user.uid, file);
  return new NextResponse();
}
