import path from 'node:path';
// @ts-expect-error no types provided
import webExt from 'web-ext';
import fs from 'node:fs';
import {
  getExtVersion,
  getFileNameFromVersion,
} from '@bypass/configs/manifest/extensionFile';
import { PATHS } from './constant';

const { downloadedFiles } = await webExt.cmd.sign({
  amoBaseUrl: 'https://addons.mozilla.org/api/v5/',
  apiKey: process.env['FIREFOX_API_KEY'],
  apiSecret: process.env['FIREFOX_API_SECRET'],
  sourceDir: PATHS.FIREFOX_BUILD,
  artifactsDir: PATHS.BUILD_DIR,
  channel: 'unlisted',
});

const xpiFilename = downloadedFiles[0] as string;

fs.renameSync(
  path.join(PATHS.BUILD_DIR, xpiFilename),
  path.join(
    PATHS.BUILD_DIR,
    `firefox-${getFileNameFromVersion(getExtVersion(), false)}`
  )
);

console.log('Firefox Extension packaged successfully');
