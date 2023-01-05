import { backupData } from '@bypass/trpc';
import bearerToken from 'express-bearer-token';
import { NextApiRequest, NextApiResponse } from 'next';
import runMiddleware from 'src/middlewares/runMiddleware';

type NextApiRequestWithToken = NextApiRequest & {
  token?: string;
};

const handler = async (req: NextApiRequestWithToken, res: NextApiResponse) => {
  runMiddleware(req, res, bearerToken());

  const authBearerToken = req.token;
  console.log(process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY);
  if (authBearerToken !== process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.status(401).end();
  }
  await backupData();
  return res.json({ status: 'Firebase backup successful' });
};

export default handler;
