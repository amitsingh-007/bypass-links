import { z } from 'zod/mini';

import { protectedProcedure } from '../procedures';
import {
  getFileFromFirebase,
  getFilesFromFirebase,
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

  /** Batched counterpart, keyed by file name; names with no url are omitted. */
  getDownloadUrls: protectedProcedure
    .input(z.array(z.string()))
    .output(z.record(z.string(), z.string()))
    .query(async ({ input, ctx }) => {
      return getFilesFromFirebase(ctx.user.uid, input);
    }),

  removeFile: protectedProcedure
    .input(z.string())
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await removeFileFromFirebase(ctx.user.uid, input);
    }),
});

export default firebaseStorageRouter;
