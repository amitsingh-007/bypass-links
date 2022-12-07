import { getFromFirebase, saveToFirebase } from '@logic/firebase';
import runMiddleware from 'src/middlewares/runMiddleware';
import bearerToken from 'express-bearer-token';
import { NextApiRequest, NextApiResponse } from 'next';
import { FIREBASE_DB_ROOT_KEYS } from '@common/utils/firebase';

type NextApiRequestWithToken = NextApiRequest & {
  token?: string;
};

const handler = async (req: NextApiRequestWithToken, res: NextApiResponse) => {
  runMiddleware(req, res, bearerToken());

  const authBearerToken = req.token;
  if (authBearerToken !== process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.status(401).end();
  }
  const snapshot = await getFromFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.data,
    isAbsolute: true,
  });
  await saveToFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.backup,
    data: snapshot.val(),
    isAbsolute: true,
  });
  res.json({ status: 'Firebase backup successful' });
};

export default handler;
