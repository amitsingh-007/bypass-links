import { uploadImageToFirebase } from '@bypass/trpc/appRouter';
import { type NextRequest, NextResponse } from 'next/server';

import { authorizeUser } from '@app/helpers/authorizeUser';

import { validateAndProccessFile } from './utils';

export async function POST(request: NextRequest) {
  const auth = await authorizeUser(request);
  if (!auth.ok) {
    return new NextResponse(auth.message, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file !== 'object') {
    return new NextResponse('No image found to upload', { status: 400 });
  }
  const fileBuffer = await validateAndProccessFile(file);
  if (!fileBuffer) {
    return new NextResponse('Invalid file type', { status: 400 });
  }

  await uploadImageToFirebase(auth.user.uid, {
    fileName: file.name,
    fileType: file.type,
    buffer: fileBuffer,
  });

  return new NextResponse();
}
