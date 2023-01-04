import { t } from '../trpc';
import extensionRouter from './extension';

export const appRouter = t.router({
  extension: extensionRouter,
});

export type AppRouter = typeof appRouter;
