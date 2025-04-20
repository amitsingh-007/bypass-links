import {
  BookmarksAndPersonsValidationSchema,
  BookmarksObjSchema,
  LastVisitedSchema,
  PersonsSchema,
  RedirectionsSchema,
  WebsitesSchema,
} from '@bypass/shared/schema';
import { z } from 'zod';
import { protectedProcedure } from '../procedures';
import {
  getBookmarks,
  getLastVisited,
  getPersons,
  getRedirections,
  getWebsites,
  saveBookmarksAndPersons,
  saveLastVisited,
  saveRedirections,
} from '../services/firebase/realtimeDBService';
import { t } from '../trpc';

const firebaseDataRouter = t.router({
  bookmarksGet: protectedProcedure
    .output(BookmarksObjSchema)
    .query(async ({ ctx }) => {
      return getBookmarks(ctx.user);
    }),

  personsGet: protectedProcedure
    .output(PersonsSchema)
    .query(async ({ ctx }) => {
      return getPersons(ctx.user);
    }),

  bookmarkAndPersonSave: protectedProcedure
    .input(BookmarksAndPersonsValidationSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return saveBookmarksAndPersons(input.bookmarks, input.persons, ctx.user);
    }),

  websitesGet: protectedProcedure
    .output(WebsitesSchema)
    .query(async ({ ctx }) => {
      return getWebsites(ctx.user);
    }),

  lastVisitedGet: protectedProcedure
    .output(LastVisitedSchema)
    .query(async ({ ctx }) => {
      return getLastVisited(ctx.user);
    }),
  lastVisitedPost: protectedProcedure
    .input(LastVisitedSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return saveLastVisited(input, ctx.user);
    }),

  redirectionsGet: protectedProcedure
    .output(RedirectionsSchema)
    .query(async ({ ctx }) => {
      return getRedirections(ctx.user);
    }),
  redirectionsPost: protectedProcedure
    .input(RedirectionsSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return saveRedirections(input, ctx.user);
    }),
});

export default firebaseDataRouter;
