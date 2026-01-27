import verifyAuthMiddleware from './middlewares/verifyAuthentication';
import { t } from './trpc';

export const protectedProcedure = t.procedure.use(verifyAuthMiddleware);
