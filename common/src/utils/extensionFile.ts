const FILE_NAME = {
  prefix: 'bypass-links-',
  suffix: '.zip',
};

export const getFileNameFromVersion = (extVersion: string) =>
  `${FILE_NAME.prefix}${extVersion}${FILE_NAME.suffix}`;

export const getVersionFromFileName = (fileName: string) =>
  fileName.substring(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(FILE_NAME.suffix)
  );

module.exports = {
  getFileNameFromVersion,
  getVersionFromFileName,
};
