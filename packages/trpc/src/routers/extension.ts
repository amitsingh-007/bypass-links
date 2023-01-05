import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getLatestExtension } from '../services/extensionService';
import { t } from '../trpc';
import { getVersionFromFileName } from '@bypass/shared';

const extensionRouter = t.router({
  latest: t.procedure.input(z.void()).query(async () => {
    const extension = await getLatestExtension();
    if (!extension) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Extension not found',
      });
    }
    const { browser_download_url, name, updated_at } = extension;
    return {
      extension: browser_download_url,
      version: getVersionFromFileName(name),
      date: updated_at,
    };
  }),
});

export default extensionRouter;
