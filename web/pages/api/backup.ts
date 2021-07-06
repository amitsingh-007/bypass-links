import { getFromFirebase, saveToFirebase } from "@logic/firebase";
import runMiddleware from "@middlewares/runMiddleware";
import bearerToken from "express-bearer-token";
import { getEnv } from "@common/utils/env";
import { NextApiRequest, NextApiResponse } from "next";

export interface Request extends NextApiRequest {
  token: string;
}

const handler = async (req: Request, res: NextApiResponse) => {
  runMiddleware(req, res, bearerToken());

  const authBearerToken = req.token;
  if (authBearerToken !== process.env.FIREBASE_BACKUP_CRON_JOB_API_KEY) {
    return res.status(401);
  }
  const env = getEnv();
  const snapshot = await getFromFirebase({ ref: env, isAbsolute: true });
  await saveToFirebase({
    ref: `/backup/${env}`,
    data: snapshot.val(),
    isAbsolute: true,
  });
  res.json({ status: "Firebase backup successful" });
};

export default handler;
