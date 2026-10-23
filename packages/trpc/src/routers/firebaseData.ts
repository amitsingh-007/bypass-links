import {
  BookmarksAndPersonsValidationSchema,
  BookmarksObjSchema,
  LastVisitedSchema,
  PersonsSchema,
  RedirectionsSchema,
  WebsitesSchema,
} from '@bypass/shared/server';
import { z } from 'zod/mini';

import {
  getBookmarks,
  getLastVisited,
  getPersons,
  listRedirections,
  getWebsites,
  saveBookmarksAndPersons,
  saveRedirections,
  upsertLastVisited,
} from '../services/firebase/realtimeDBService';
import { protectedProcedure, t } from '../trpc';

const NameCodecInputSchema = z.optional(
  z.object({ nameCodecVersion: z.literal(2) })
);

const firebaseDataRouter = t.router({
  bookmarksGet: protectedProcedure
    .input(NameCodecInputSchema)
    .output(BookmarksObjSchema)
    .query(async ({ ctx, input }) => {
      return getBookmarks(ctx.user.uid, input?.nameCodecVersion);
    }),

  personsGet: protectedProcedure
    .input(NameCodecInputSchema)
    .output(PersonsSchema)
    .query(async ({ ctx, input }) => {
      return getPersons(ctx.user.uid, input?.nameCodecVersion);
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

  redirectionsList: protectedProcedure
    .output(RedirectionsSchema)
    .query(async ({ ctx }) => listRedirections(ctx.user.uid)),

  redirectionsPost: protectedProcedure
    .input(RedirectionsSchema)
    .mutation(async ({ input, ctx }) => {
      return saveRedirections(input, ctx.user.uid);
    }),
});

export default firebaseDataRouter;
