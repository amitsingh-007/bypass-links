const getFullDbPath = (ref, uid, isFallback) => {
  const env = __PROD__ ? "prod" : "dev";
  const dbPrefix = isFallback ? "fallback" : "live";
  return `${env}/${uid}/${dbPrefix}/${ref}`;
};

module.exports = {
  getFullDbPath,
};
