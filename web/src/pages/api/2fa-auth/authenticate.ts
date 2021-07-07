import { authenticate2FA } from "@logic/twoFactorAuth";
import withAuth from "src/middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to authenticate the user when he tries to login
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, totp } = req.query as { [key: string]: string };
  const isVerified = await authenticate2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
