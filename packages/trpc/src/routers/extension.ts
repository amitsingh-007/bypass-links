import { z } from 'zod/mini';

import { getLatestExtension } from '../services/extensionService';
import { protectedProcedure, t } from '../trpc';

const ExtensionAssetSchema = z.object({
  downloadLink: z.string(),
  version: z.string(),
  date: z.string(),
});

const extensionRouter = t.router({
  latest: protectedProcedure
    .output(z.object({ chrome: ExtensionAssetSchema }))
    .query(async () => {
      return getLatestExtension();
    }),
});

export default extensionRouter;
