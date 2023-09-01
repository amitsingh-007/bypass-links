import { backupData } from '@bypass/trpc';
import { NextApiRequest, NextApiResponse } from 'next';
import { serverEnv } from '@/constants/env/server.mjs';

type NextApiRequestWithToken = NextApiRequest & {
  token?: string;
};

const handler = async (req: NextApiRequestWithToken, res: NextApiResponse) => {
  const authBearerToken = req.query.access_token;
  if (authBearerToken !== serverEnv.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.status(401).end();
  }
  await backupData();
  return res.json({ status: 'Firebase backup successful' });
};

export default handler;
