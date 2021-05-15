const get2FATitle = () =>
  __PROD__ ? process.env.SITE_NAME : "Bypass Links - Local";

module.exports = {
  get2FATitle,
};
