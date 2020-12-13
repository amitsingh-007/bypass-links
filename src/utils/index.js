const getExtensionFile = (version) => `bypass-links-${version}.zip`;

const isProd = () => __PROD__ === "true";

module.exports = {
  getExtensionFile,
  isProd,
};
