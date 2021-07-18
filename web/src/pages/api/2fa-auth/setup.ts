import { Setup2FAResponse } from "@common/interfaces/twoFactorAuth";
import { setup2FA } from "@logic/twoFactorAuth";
import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";

/**
 * API to initalize 2FA of a user for the very first time
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Setup2FAResponse>
) => {
  const uid = <string>req.query.uid;
  const { secretKey, otpAuthUrl } = await setup2FA(uid);
  res.json({ secretKey, otpAuthUrl });
};

export default withAuth(handler);
