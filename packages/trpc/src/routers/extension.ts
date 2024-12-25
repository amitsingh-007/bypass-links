import { z } from 'zod';
import { protectedProcedure } from '../procedures';
import { getLatestExtension } from '../services/extensionService';
import { t } from '../trpc';

const extensionRouter = t.router({
  latest: protectedProcedure.input(z.void()).query(async () => {
    return getLatestExtension();
  }),
});

export default extensionRouter;
