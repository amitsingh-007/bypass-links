import fs from 'node:fs';
import archiver from 'archiver';
import path from 'node:path';
import {
  getExtVersion,
  getFileNameFromVersion,
} from '@bypass/configs/manifest/extensionFile';
import { PATHS } from './constant';

fs.mkdirSync(PATHS.BUILD_DIR, { recursive: true }); // Ensure output directory exists

const output = fs.createWriteStream(
  path.join(
    PATHS.BUILD_DIR,
    `chrome-${getFileNameFromVersion(getExtVersion(), true)}`
  )
);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('end', () => console.log('Chrome Extension packaged successfully'));

archive.pipe(output);

archive.directory(PATHS.CHROME_BUILD, false);

archive.finalize();
