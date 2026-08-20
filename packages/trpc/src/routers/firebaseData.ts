import {
  BookmarksAndPersonsValidationSchema,
  BookmarksObjSchema,
  LastVisitedSchema,
  PersonsSchema,
  RedirectionsSchema,
  WebsitesSchema,
} from '@bypass/shared/schema';
import { z } from 'zod/mini';

import {
  getBookmarks,
  getLastVisited,
  getPersons,
  getRedirections,
  getWebsites,
  saveBookmarksAndPersons,
  saveRedirections,
  upsertLastVisited,
} from '../services/firebase/realtimeDBService';
import { protectedProcedure, t } from '../trpc';

const firebaseDataRouter = t.router({
  bookmarksGet: protectedProcedure
    .output(BookmarksObjSchema)
    .query(async ({ ctx }) => {
      return getBookmarks(ctx.user.uid);
    }),

  personsGet: protectedProcedure
    .output(PersonsSchema)
    .query(async ({ ctx }) => {
      return getPersons(ctx.user.uid);
    }),

  bookmarkAndPersonSave: protectedProcedure
    .input(BookmarksAndPersonsValidationSchema)
    .mutation(async ({ input, ctx }) => {
      return saveBookmarksAndPersons(
        input.bookmarks,
        input.persons,
        ctx.user.uid
      );
    }),

  websitesGet: protectedProcedure
    .output(WebsitesSchema)
    .query(async ({ ctx }) => {
      return getWebsites(ctx.user.uid);
    }),

  lastVisitedGet: protectedProcedure
    .output(LastVisitedSchema)
    .query(async ({ ctx }) => {
      return getLastVisited(ctx.user.uid);
    }),
  upsertLastVisited: protectedProcedure
    .input(z.object({ hash: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return upsertLastVisited(input.hash, ctx.user.uid);
    }),

  redirectionsGet: protectedProcedure
    .output(RedirectionsSchema)
    .query(async ({ ctx }) => {
      return getRedirections(ctx.user.uid);
    }),
  redirectionsPost: protectedProcedure
    .input(RedirectionsSchema)
    .mutation(async ({ input, ctx }) => {
      return saveRedirections(input, ctx.user.uid);
    }),
});

export default firebaseDataRouter;
