import { t } from '../trpc';
import firebaseDataRouter from './firebaseData';
import extensionRouter from './extension';
import twoFactorAuthRouter from './twoFactorAuth';
import firebaseStorageRouter from './firebaseStorage';

export const appRouter = t.router({
  extension: extensionRouter,
  twoFactorAuth: twoFactorAuthRouter,
  firebaseData: firebaseDataRouter,
  storage: firebaseStorageRouter,
});

export type AppRouter = typeof appRouter;
