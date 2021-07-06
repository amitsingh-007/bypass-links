import { authenticate2FA } from "@logic/twoFactorAuth";
import withAuth from "@middlewares/withAuth";

/**
 * API to authenticate the user when he tries to login
 */
const handler = async (req, res) => {
  const { uid, totp } = req.query;
  const isVerified = await authenticate2FA({ uid, totp });
  res.json({ isVerified });
};

export default withAuth(handler);
