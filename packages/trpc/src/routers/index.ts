import { t } from '../trpc';
import firebaseDataRouter from './firebaseData';
import extensionRouter from './extension';
import firebaseStorageRouter from './firebaseStorage';

export const appRouter = t.router({
  extension: extensionRouter,
  firebaseData: firebaseDataRouter,
  storage: firebaseStorageRouter,
});

export type AppRouter = typeof appRouter;
