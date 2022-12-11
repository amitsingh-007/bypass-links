import { resolve } from 'path';

export const PATHS = {
  COMMON: resolve(__dirname, '..', '..', 'common'),
  EXTENSION: resolve(__dirname, '..', 'extension-build'),
  FIREBASE: resolve(__dirname, '..', 'firebase-dll'),
  SRC: resolve(__dirname, '..', 'src'),
  ROOT: resolve(__dirname, '..'),
};
