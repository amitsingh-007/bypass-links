import { authorizeUser } from '@app/helpers/authorizeUser';
import { uploadImageToFirebase } from '@bypass/trpc/appRouter';
import { type NextRequest, NextResponse } from 'next/server';
import { validateAndProccessFile } from './utils';

export async function POST(request: NextRequest) {
  const user = await authorizeUser(request);

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
