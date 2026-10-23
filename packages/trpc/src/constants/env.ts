import process from 'node:process';

import { loadRootEnv } from '@bypass/configs/env';
import { z } from 'zod/mini';

const secretSchema = z.string().check(z.minLength(1));

export const getFirebaseServiceAccount = () => {
  loadRootEnv();
  return secretSchema.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
};

export const getGithubToken = () => {
  loadRootEnv();
  return secretSchema.parse(process.env.GITHUB_TOKEN);
};
