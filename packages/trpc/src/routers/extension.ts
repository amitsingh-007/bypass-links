import { z } from 'zod';
import { publicProcedure } from '../procedures';
import { getLatestExtension } from '../services/extensionService';
import { t } from '../trpc';

const extensionRouter = t.router({
  latest: publicProcedure.input(z.void()).query(async () => {
    return getLatestExtension();
  }),
});

export default extensionRouter;
