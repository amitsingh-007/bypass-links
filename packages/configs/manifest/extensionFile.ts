import manifest from './manifest.base.json' assert { type: 'json' };

const FILE_NAME = {
  prefix: 'bypass-links-',
  chromeSuffix: '.zip',
  firefoxSuffix: '.xpi',
};

const getSuffix = (isChrome: boolean) =>
  isChrome ? FILE_NAME.chromeSuffix : FILE_NAME.firefoxSuffix;

export const getExtVersion = () => manifest.version;

export const getFileNameFromVersion = (extVersion: string, isChrome: boolean) =>
  `${FILE_NAME.prefix}${extVersion}${getSuffix(isChrome)}`;

export const getVersionFromFileName = (fileName: string, isChrome: boolean) =>
  fileName.slice(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(getSuffix(isChrome))
  );
