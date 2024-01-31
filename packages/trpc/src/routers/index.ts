import { t } from '../trpc';
import firebaseDataRouter from './firebaseData';
import extensionRouter from './extension';
import loggingRouter from './logging';
import twoFactorAuthRouter from './twoFactorAuth';

export const appRouter = t.router({
  extension: extensionRouter,
  twoFactorAuth: twoFactorAuthRouter,
  logging: loggingRouter,
  firebaseData: firebaseDataRouter,
});

export type AppRouter = typeof appRouter;
