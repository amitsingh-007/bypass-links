import { fetchUser2FAInfo, is2FAEnabled } from "@logic/twoFactorAuth";
import withAuth from "@middlewares/withAuth";

/**
 * API which indicates whether 2FA is enabled by the user or not
 */
const handler = async (req, res) => {
  const { uid } = req.query;
  const user2FAInfo = await fetchUser2FAInfo(uid);
  res.json({ is2FAEnabled: is2FAEnabled(user2FAInfo) });
};

export default withAuth(handler);
