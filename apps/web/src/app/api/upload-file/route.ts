import { authorizeUser } from '@/helpers/authorizeUser';
import { uploadImageToFirebase } from '@bypass/trpc/appRouter';
import { fileTypeFromBuffer } from 'file-type';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const getCompressedImage = async (file: File) => {
  return sharp(Buffer.from(await file.arrayBuffer()))
    .resize({ width: 250, withoutEnlargement: true })
    .jpeg({ quality: file.size < 50 * 1024 ? 100 : 90 })
    .toBuffer();
};

const validateAndProccessFile = async (file: File) => {
  const fileTypeRes = await fileTypeFromBuffer(
    Buffer.from(await file.arrayBuffer())
  );
  if (!fileTypeRes) {
    return null;
  }
  switch (true) {
    case fileTypeRes.mime.startsWith('image/'):
      return getCompressedImage(file);
    default:
      return null;
  }
};

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
