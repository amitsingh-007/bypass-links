import { FIREBASE_DB_REF } from "../../../../common/src/constants/firebase";
import { removeFromFirebase } from "../../../logic/firebase";

/**
 * API to revoke 2FA of the given user
 */
const handler = async (req, res) => {
  const { uid } = req.query;
  await removeFromFirebase({
    ref: `${FIREBASE_DB_REF.userInfo}/twoFactorAuth/`,
    uid,
  });
  res.json({ isRevoked: true });
};

export default handler;
