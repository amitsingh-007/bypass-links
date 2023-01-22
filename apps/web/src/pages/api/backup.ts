import { backupData } from '@bypass/trpc';
import { NextApiRequest, NextApiResponse } from 'next';

type NextApiRequestWithToken = NextApiRequest & {
  token?: string;
};

const handler = async (req: NextApiRequestWithToken, res: NextApiResponse) => {
  const authBearerToken = req.query.access_token as string;
  if (authBearerToken !== process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.status(401).end();
  }
  await backupData();
  return res.json({ status: 'Firebase backup successful' });
};

export default handler;
