import fs from 'fs';
import archiver from 'archiver';
import { PATHS } from '../webpack/constants';
import { extVersion } from '../../common/src/scripts/extension-version';
import { getFileNameFromVersion } from '../../common/src/utils/extensionFile';

const output = fs.createWriteStream(
  `${PATHS.EXTENSION}/${getFileNameFromVersion(extVersion)}`
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
