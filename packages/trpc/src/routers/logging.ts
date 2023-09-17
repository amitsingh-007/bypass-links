import { logRequestSchema } from '../constants/logs';
import { publicProcedure } from '../procedures';
import { logToAxiom } from '../services/loggingService';
import { t } from '../trpc';

const loggingRouter = t.router({
  log: publicProcedure
    .input(logRequestSchema)
    .mutation(async ({ input, ctx }) => {
      await logToAxiom(input, ctx.reqMetaData);
    }),
});

export default loggingRouter;
