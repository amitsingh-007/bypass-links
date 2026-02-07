import path from 'node:path';
import process from 'node:process';

export const getExtensionPath = () => {
  return path.resolve(process.cwd(), 'apps/extension/.output/chrome-mv3');
};
