const releaseConfig = require("../release-config.json");

exports.getExtensionFile = () => `bypass-links-${releaseConfig.version}.zip`;
