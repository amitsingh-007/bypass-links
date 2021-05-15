const setEnvVars = (_req, _res, next) => {
  const isDev = process.env.NETLIFY_DEV === "true";
  global.__PROD__ = !isDev;
  process.env.__PROD__ = !isDev;
  next();
};

module.exports = setEnvVars;
