import { t } from '../trpc';
import extensionRouter from './extension';
import twoFactorAuthRouter from './twoFactorAuth';

export const appRouter = t.router({
  extension: extensionRouter,
  twoFactorAuth: twoFactorAuthRouter,
});

export type AppRouter = typeof appRouter;
