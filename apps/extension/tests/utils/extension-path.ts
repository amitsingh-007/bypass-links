import path from 'node:path';
import process from 'node:process';

export const getExtensionPath = () => {
  const isCI = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);
  const buildDir = isCI ? 'chrome-mv3' : 'chrome-mv3-dev';
  return path.resolve(process.cwd(), 'apps/extension/.output', buildDir);
};
