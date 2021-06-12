const getEnv = () => (__PROD__ ? "prod" : "dev");

module.exports = {
  getEnv,
};
