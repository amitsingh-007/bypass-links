/* eslint-disable turbo/no-undeclared-env-vars */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error no types provided
import webExt from 'web-ext';
import fs from 'node:fs';
import {
  getExtVersion,
  getFileNameFromVersion,
} from '@bypass/configs/manifest/extensionFile';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const rootDir = path.join(dirName, '..');
const inputDir = path.join(rootDir, 'firefox-build');
const outDir = path.join(rootDir, 'build');

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const { downloadedFiles } = await webExt.cmd.sign({
  amoBaseUrl: 'https://addons.mozilla.org/api/v5/',
  apiKey: process.env['FIREFOX_API_KEY'],
  apiSecret: process.env['FIREFOX_API_SECRET'],
  sourceDir: inputDir,
  artifactsDir: outDir,
  channel: 'unlisted',
});

const xpiFilename = downloadedFiles[0] as string;

fs.renameSync(
  path.join(outDir, xpiFilename),
  path.join(outDir, `firefox-${getFileNameFromVersion(getExtVersion(), false)}`)
);

console.log('Firefox Extension packaged successfully');
