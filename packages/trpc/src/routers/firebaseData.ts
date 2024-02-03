import {
  IBookmarksObj,
  ILastVisited,
  IPersons,
  IRedirection,
  ISettings,
} from '@bypass/shared';
import { protectedProcedure } from '../procedures';
import {
  getBookmarks,
  getBypass,
  getLastVisited,
  getPersons,
  getRedirections,
  getSettings,
  saveBookmarks,
  saveLastVisited,
  savePersons,
  saveRedirections,
  saveSettings,
} from '../services/firebase/realtimeDBService';
import { t } from '../trpc';

// TODO: add POST route input validations after firestore
// TODO: add atomic read/update APIs after firestore
const firebaseDataRouter = t.router({
  bookmarksGet: protectedProcedure.query(async ({ ctx }) => {
    return getBookmarks(ctx.user);
  }),
  bookmarksPost: protectedProcedure
    .input((input: unknown) => input as IBookmarksObj)
    .mutation(async ({ input, ctx }) => {
      return saveBookmarks(input, ctx.user);
    }),

  personsGet: protectedProcedure.query(async ({ ctx }) => {
    return getPersons(ctx.user);
  }),
  personsPost: protectedProcedure
    .input((input: unknown) => input as IPersons)
    .mutation(async ({ input, ctx }) => {
      return savePersons(input, ctx.user);
    }),

  settingsGet: protectedProcedure.query(async ({ ctx }) => {
    return getSettings(ctx.user);
  }),
  settingsPost: protectedProcedure
    .input((input: unknown) => input as ISettings)
    .mutation(async ({ input, ctx }) => {
      return saveSettings(input, ctx.user);
    }),

  bypassGet: protectedProcedure.query(async ({ ctx }) => {
    return getBypass(ctx.user);
  }),

  lastVisitedGet: protectedProcedure.query(async ({ ctx }) => {
    return getLastVisited(ctx.user);
  }),
  lastVisitedPost: protectedProcedure
    .input((input: unknown) => input as ILastVisited)
    .mutation(async ({ input, ctx }) => {
      return saveLastVisited(input, ctx.user);
    }),

  redirectionsGet: protectedProcedure.query(async ({ ctx }) => {
    return getRedirections(ctx.user);
  }),
  redirectionsPost: protectedProcedure
    .input((input: unknown) => input as IRedirection[])
    .mutation(async ({ input, ctx }) => {
      return saveRedirections(input, ctx.user);
    }),
});

export default firebaseDataRouter;
