import manifest from './manifest.base.json' assert { type: 'json' };

const FILE_NAME = {
  prefix: 'bypass-links-',
  suffix: '.zip',
};

export const getExtVersion = () => manifest.version;

export const getFileNameFromVersion = (extVersion: string) =>
  `${FILE_NAME.prefix}${extVersion}${FILE_NAME.suffix}`;

export const getVersionFromFileName = (fileName: string) =>
  fileName.slice(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(FILE_NAME.suffix)
  );
