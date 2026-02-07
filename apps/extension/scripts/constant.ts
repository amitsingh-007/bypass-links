import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fileName = fileURLToPath(import.meta.url);
const curDir = path.dirname(fileName);
const rootExtDir = path.join(curDir, '..');

export const PATHS = {
  CHROME_BUILD: path.join(rootExtDir, '.output', 'chrome-mv3'),
  BUILD_DIR: path.join(rootExtDir, 'build'),
};
