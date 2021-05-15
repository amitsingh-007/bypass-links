const verifyUserId = (req, res, next) => {
  const { uid } = req.query;
  const isValidUid = uid && /^[a-zA-Z0-9]+$/.test(uid);
  if (!isValidUid) {
    res.status(400).json({ message: "Invalid UID" });
    return;
  }
  next();
};

module.exports = verifyUserId;
