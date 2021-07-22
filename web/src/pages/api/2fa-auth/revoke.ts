import { Revoke2FAResponse } from "@common/interfaces/twoFactorAuth";
import { disableUser2FA } from "@database/authenticate";
import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";

/**
 * API to revoke 2FA of the given user
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Revoke2FAResponse>
) => {
  const uid = req.query.uid as string;
  const isSuccess = await disableUser2FA(uid);
  res.json({ isRevoked: isSuccess });
};

export default withAuth(handler);
