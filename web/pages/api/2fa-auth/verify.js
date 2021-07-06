import { verify2FA } from "@logic/twoFactorAuth";
import withAuth from "@middlewares/withAuth";

/**
 * API to verify the user while setting up 2FA
 */
const handler = async (req, res) => {
  const { uid, totp } = req.query;
  const isVerified = await verify2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
