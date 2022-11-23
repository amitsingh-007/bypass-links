const FILE_NAME = {
  prefix: 'bypass-links-',
  suffix: '.zip',
};

const getFileNameFromVersion = (extVersion) =>
  `${FILE_NAME.prefix}${extVersion}${FILE_NAME.suffix}`;

const getVersionFromFileName = (fileName) =>
  fileName.substring(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(FILE_NAME.suffix)
  );

module.exports = {
  getFileNameFromVersion,
  getVersionFromFileName,
};
