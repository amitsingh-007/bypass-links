const getExtensionFile = (version) => `bypass-links-${version}.zip`;

const isProd = () => process.env.NODE_ENV === "production";

module.exports = {
  getExtensionFile,
  isProd,
};
