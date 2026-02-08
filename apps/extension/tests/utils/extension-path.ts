import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const getExtensionPath = () => {
  const isCI = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);
  const buildDir = isCI ? 'chrome-mv3' : 'chrome-mv3-dev';
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.output',
    buildDir
  );
};
