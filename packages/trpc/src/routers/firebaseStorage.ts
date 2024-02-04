import { z } from 'zod';
import { protectedProcedure } from '../procedures';
import { t } from '../trpc';
import {
  getFileFromFirebase,
  removeFileFromFirebase,
} from '../services/firebaseAdminService';

const firebaseStorageRouter = t.router({
  getDownloadUrl: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return getFileFromFirebase(ctx.user.uid, input);
    }),

  removeFile: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await removeFileFromFirebase(ctx.user.uid, input);
    }),
});

export default firebaseStorageRouter;
