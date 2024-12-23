import fs from 'node:fs';
import archiver from 'archiver';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  getExtVersion,
  getFileNameFromVersion,
} from '@bypass/configs/manifest/extensionFile';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const rootDir = path.join(dirName, '..');
const inputDir = path.join(rootDir, 'chrome-build');
const outDir = path.join(rootDir, 'build');

fs.mkdirSync(outDir, { recursive: true }); // Ensure output directory exists

const output = fs.createWriteStream(
  path.join(outDir, `chrome-${getFileNameFromVersion(getExtVersion(), true)}`)
);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('end', () => console.log('Chrome Extension packaged successfully'));

archive.pipe(output);

archive.directory(inputDir, false);

archive.finalize();
