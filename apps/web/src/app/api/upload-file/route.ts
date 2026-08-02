import { uploadImageToFirebase } from '@bypass/trpc/appRouter';
import { type NextRequest, NextResponse } from 'next/server';

import { authorizeUser, toAuthErrorResponse } from '@app/helpers/authorizeUser';

import { validateAndProccessFile } from './utils';

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await authorizeUser(request);
  } catch (error) {
    // 401/403 instead of the 500 a bare thrown Error produced
    return toAuthErrorResponse(error);
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

  await uploadImageToFirebase(user.uid, {
    fileName: file.name,
    fileType: file.type,
    buffer: fileBuffer,
  });

  return new NextResponse();
}
