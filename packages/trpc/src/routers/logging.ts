import { logRequestSchema } from '../constants/logs';
import { logToAxiom } from '../services/loggingService';
import { t } from '../trpc';

const loggingRouter = t.router({
  log: t.procedure.input(logRequestSchema).mutation(async ({ input, ctx }) => {
    await logToAxiom(input, ctx.reqMetaData);
  }),
});

export default loggingRouter;
