import { FIREBASE_DB_REF } from '@bypass/shared';
import { z } from 'zod';
import { removeFromFirebase } from '../services/firebaseAdminService';
import {
  authenticate2FA,
  is2FAEnabled,
  setup2FA,
  verify2FA,
} from '../services/twoFactorAuthService';
import { fetchUser2FAInfo } from '../services/userService';
import { t } from '../trpc';
import { protectedProcedure } from '../procedures';

const twoFactorAuthRouter = t.router({
  // Authenticates the user when they try to login
  authenticate: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        totp: z.string(),
      })
    )
    .query(async ({ input }) => ({
      isVerified: await authenticate2FA(input),
    })),

  // Verifies the user code while setting up 2FA
  verify: protectedProcedure
    .input(
      z.object({
        uid: z.string(),
        totp: z.string(),
      })
    )
    .query(async ({ input }) => ({
      isVerified: await verify2FA(input),
    })),

  // Revoke 2FA for the user
  revoke: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: uid }) => {
      await removeFromFirebase({
        ref: FIREBASE_DB_REF.user2FAInfo,
        uid,
      });
      return { isRevoked: true };
    }),

  // Initializes 2FA for a user for the very first time
  setup: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: uid }) => {
      const { secretKey, otpAuthUrl } = await setup2FA(uid);
      return { secretKey, otpAuthUrl };
    }),

  // Indicates whether 2FA is enabled by the user or not
  status: protectedProcedure.input(z.string()).query(async ({ input: uid }) => {
    const user2FAInfo = await fetchUser2FAInfo(uid);
    return { is2FAEnabled: is2FAEnabled(user2FAInfo) };
  }),
});

export default twoFactorAuthRouter;
