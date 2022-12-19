import { getFaviconUrl } from '@bypass/common/utils';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  const response = await fetch(getFaviconUrl(query.url as string));
  const imageBlob = await response.blob();
  const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
  res.setHeader(
    'content-type',
    response.headers.get('content-type') ?? 'image'
  );
  res.write(imageBuffer, 'binary');
  res.end();
};

export default handler;
