const manifest = require('@bypass/shared/configs/manifest.json');

const FILE_NAME = {
  prefix: 'bypass-links-',
  suffix: '.zip',
};

const getExtVersion = () => manifest.version;

//@ts-ignore
const getFileNameFromVersion = (extVersion) =>
  `${FILE_NAME.prefix}${extVersion}${FILE_NAME.suffix}`;

//@ts-ignore
const getVersionFromFileName = (fileName) =>
  fileName.substring(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(FILE_NAME.suffix)
  );

module.exports = {
  getExtVersion,
  getFileNameFromVersion,
  getVersionFromFileName,
};
