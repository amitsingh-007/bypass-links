import verifyAuthMiddleware from './middlewares/verifyAuthentication';
import { t } from './trpc';

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(verifyAuthMiddleware);
