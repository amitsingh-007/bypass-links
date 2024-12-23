import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fileName = fileURLToPath(import.meta.url);
const curDir = path.dirname(fileName);
const rootExtDir = path.join(curDir, '..');

export const PATHS = {
  CHROME_BUILD: path.join(rootExtDir, 'chrome-build'),
  FIREFOX_BUILD: path.join(rootExtDir, 'firefox-build'),
  BUILD_DIR: path.join(rootExtDir, 'build'),
};
