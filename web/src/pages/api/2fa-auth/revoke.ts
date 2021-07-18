import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { Revoke2FAResponse } from "@common/interfaces/twoFactorAuth";
import { removeFromFirebase } from "@logic/firebase";
import { NextApiRequest, NextApiResponse } from "next";
import withAuth from "src/middlewares/withAuth";

/**
 * API to revoke 2FA of the given user
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Revoke2FAResponse>
) => {
  const uid = <string>req.query.uid;
  await removeFromFirebase({
    ref: FIREBASE_DB_REF.user2FAInfo,
    uid,
  });
  res.json({ isRevoked: true });
};

export default withAuth(handler);
