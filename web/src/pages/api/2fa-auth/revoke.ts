import { removeFromFirebase } from "@logic/firebase";
import { FIREBASE_DB_REF } from "@common/constants/firebase";
import withAuth from "src/middlewares/withAuth";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API to revoke 2FA of the given user
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const uid = <string>req.query.uid;
  await removeFromFirebase({
    ref: `${FIREBASE_DB_REF.userInfo}/twoFactorAuth/`,
    uid,
  });
  res.json({ isRevoked: true });
};

export default withAuth(handler);
