const { getEnv } = require("./env");

const getFullDbPath = (ref, uid, isAbsolute = false) => {
  if (isAbsolute) {
    return ref;
  }
  const env = getEnv();
  return `${env}/${uid}/${ref}`;
};

module.exports = {
  getFullDbPath,
};
