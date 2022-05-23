/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const archiver = require('archiver');
const { PATHS } = require('../webpack/constants');
const { extVersion } = require('../../common/src/scripts/extension-version');

const output = fs.createWriteStream(
  `${PATHS.EXTENSION}/${`bypass-links-${extVersion}.zip`}`
);

const archive = archiver('zip', { zlib: { level: 9 } }); //highest & most compression

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log(
    'archiver has been finalized and the output file descriptor has closed.'
  );
});

output.on('end', function () {
  console.log('Data has been drained');
});

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

archive.glob('**/*', {
  cwd: PATHS.EXTENSION,
  ignore: ['*.zip'], //ignore the output .zip file
});

archive.finalize();
