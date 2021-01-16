const getExtensionFile = (version) => `bypass-links-${version}.zip`;

const getRootPath = () =>
  window.location.hostname === "amitsingh-007.github.io" ? "/bypass-links" : "";

module.exports = {
  getExtensionFile,
  getRootPath,
};
