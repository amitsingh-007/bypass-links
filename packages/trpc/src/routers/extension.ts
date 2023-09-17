import { getVersionFromFileName } from '@bypass/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure } from '../procedures';
import { getLatestExtension } from '../services/extensionService';
import { t } from '../trpc';

const extensionRouter = t.router({
  latest: publicProcedure.input(z.void()).query(async () => {
    const extension = await getLatestExtension();
    if (!extension) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Extension not found',
      });
    }
    return {
      extension: extension.browser_download_url,
      version: getVersionFromFileName(extension.name),
      date: extension.updated_at,
    };
  }),
});

export default extensionRouter;
