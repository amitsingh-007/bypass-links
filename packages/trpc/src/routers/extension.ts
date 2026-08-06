import { z } from 'zod/mini';

import { protectedProcedure } from '../procedures';
import { getLatestExtension } from '../services/extensionService';
import { t } from '../trpc';

const ExtensionAssetSchema = z.object({
  downloadLink: z.string(),
  version: z.string(),
  date: z.string(),
});

const extensionRouter = t.router({
  latest: protectedProcedure
    .input(z.void())
    .output(z.object({ chrome: ExtensionAssetSchema }))
    .query(async () => {
      return getLatestExtension();
    }),
});

export default extensionRouter;
