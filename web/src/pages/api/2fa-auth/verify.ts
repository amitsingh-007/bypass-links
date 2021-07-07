import { verify2FA } from "@logic/twoFactorAuth";
import withAuth from "src/middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to verify the user while setting up 2FA
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, totp } = req.query as { [key: string]: string };
  const isVerified = await verify2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
