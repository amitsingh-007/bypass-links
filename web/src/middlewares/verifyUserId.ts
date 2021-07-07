import { NextApiRequest, NextApiResponse } from "next";

const verifyUserId = (req: NextApiRequest, res: NextApiResponse) => {
  const uid = <string>req.query.uid;
  const isValidUid = uid && /^[a-zA-Z0-9]+$/.test(uid);
  if (!isValidUid) {
    res.status(400).json({ message: "Invalid UID" });
  }
};

export default verifyUserId;
