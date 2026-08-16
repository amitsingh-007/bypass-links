import { z } from 'zod/mini';

import { protectedProcedure } from '../procedures';
import {
  getFileFromFirebase,
  listDownloadUrlsFromFirebase,
  removeFileFromFirebase,
} from '../services/firebaseAdminService';
import { t } from '../trpc';

const firebaseStorageRouter = t.router({
  getDownloadUrl: protectedProcedure
    .input(z.string())
    .output(z.string())
    .query(async ({ input, ctx }) => {
      return getFileFromFirebase(ctx.user.uid, input);
    }),

  /** Batched counterpart, keyed by file name. */
  getDownloadUrls: protectedProcedure
    .output(z.record(z.string(), z.string()))
    .query(async ({ ctx }) => {
      return listDownloadUrlsFromFirebase(ctx.user.uid);
    }),

  removeFile: protectedProcedure
    .input(z.string())
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await removeFileFromFirebase(ctx.user.uid, input);
    }),
});

export default firebaseStorageRouter;
