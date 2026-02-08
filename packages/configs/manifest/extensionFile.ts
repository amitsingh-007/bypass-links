const FILE_NAME = {
  prefix: 'bypass-links-',
  suffix: '.zip',
};

export const getVersionFromFileName = (fileName: string) =>
  fileName.slice(
    fileName.indexOf(FILE_NAME.prefix) + FILE_NAME.prefix.length,
    fileName.lastIndexOf(FILE_NAME.suffix)
  );
