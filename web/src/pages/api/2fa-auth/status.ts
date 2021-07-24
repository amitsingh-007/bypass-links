import { Status2FAResponse } from "@common/interfaces/twoFactorAuth";
import { is2FAEnabled } from "@logic/twoFactorAuth";
import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";
import { fetchUser2FA } from "@database/authenticate";

/**
 * API which indicates whether 2FA is enabled by the user or not
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Status2FAResponse>
) => {
  const uid = req.query.uid as string;
  const user2FAInfo = await fetchUser2FA(uid);
  res.json({
    is2FAEnabled: Boolean(user2FAInfo && is2FAEnabled(user2FAInfo)),
  });
};

export default withAuth(handler);
