const { getEnv } = require("./env");

export const getFullDbPath = (ref, uid, isAbsolute = false) => {
  if (isAbsolute) {
    return ref;
  }
  const env = getEnv();
  return `${env}/${uid}/${ref}`;
};
