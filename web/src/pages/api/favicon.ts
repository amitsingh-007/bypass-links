import { getFaviconUrl } from '@common/utils';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  const response = await fetch(getFaviconUrl(query.url as string));
  const imageBlob = await response.blob();
  res.setHeader(
    'content-type',
    response.headers.get('content-type') ?? 'image'
  );
  res.send(imageBlob.stream());
};

export default handler;
