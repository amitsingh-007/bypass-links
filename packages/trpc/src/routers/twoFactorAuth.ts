import { z } from 'zod/mini';
import { EFirebaseDBRef } from '../constants/firebase';
import { protectedProcedure } from '../procedures';
import { removeFromFirebase } from '../services/firebaseAdminService';
import {
  authenticate2FA,
  is2FAEnabled,
  setup2FA,
  verify2FA,
} from '../services/twoFactorAuthService';
import { fetchUser2FAInfo } from '../services/userService';
import { t } from '../trpc';

const twoFactorAuthRouter = t.router({
  // Authenticates the user when they try to login
  authenticate: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ({
      isVerified: await authenticate2FA(input, ctx.user),
    })),

  // Verifies the user code while setting up 2FA
  verify: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ({
      isVerified: await verify2FA(input, ctx.user),
    })),

  // Revoke 2FA for the user
  revoke: protectedProcedure.mutation(async ({ ctx }) => {
    await removeFromFirebase({
      ref: EFirebaseDBRef.user2FAInfo,
      uid: ctx.user.uid,
    });
    return { isRevoked: true };
  }),

  // Initializes 2FA for a user for the very first time
  setup: protectedProcedure.mutation(async ({ ctx }) => {
    return setup2FA(ctx.user);
  }),

  // Indicates whether 2FA is enabled by the user or not
  status: protectedProcedure.query(async ({ ctx }) => {
    const user2FAInfo = await fetchUser2FAInfo(ctx.user.uid);
    return { is2FAEnabled: is2FAEnabled(user2FAInfo) };
  }),
});

export default twoFactorAuthRouter;
