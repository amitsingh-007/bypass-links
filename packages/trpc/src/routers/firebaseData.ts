import {
  BookmarksObjSchema,
  BypassSchema,
  LastVisitedSchema,
  PersonsSchema,
  RedirectionsSchema,
  SettingsSchema,
} from '@bypass/shared/schema';
import { z } from 'zod';
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

const firebaseDataRouter = t.router({
  bookmarksGet: protectedProcedure
    .output(BookmarksObjSchema)
    .query(async ({ ctx }) => {
      return getBookmarks(ctx.user);
    }),
  bookmarksPost: protectedProcedure
    .input(BookmarksObjSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return saveBookmarks(input, ctx.user);
    }),

  personsGet: protectedProcedure
    .output(PersonsSchema)
    .query(async ({ ctx }) => {
      return getPersons(ctx.user);
    }),
  personsPost: protectedProcedure
    .input(PersonsSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return savePersons(input, ctx.user);
    }),

  settingsGet: protectedProcedure
    .output(SettingsSchema)
    .query(async ({ ctx }) => {
      return getSettings(ctx.user);
    }),
  settingsPost: protectedProcedure
    .input(SettingsSchema)
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      return saveSettings(input, ctx.user);
    }),

  bypassGet: protectedProcedure.output(BypassSchema).query(async ({ ctx }) => {
    return getBypass(ctx.user);
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
