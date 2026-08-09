import { getLatestExtension } from '@bypass/trpc/edge';
import { cacheLife, cacheTag } from 'next/cache';
import 'server-only';

const ONE_MONTH_IN_SEC = 30 * 24 * 60 * 60;

export const fetchExtensionData = async () => {
  'use cache';
  cacheTag('extensions-release-cache');
  cacheLife({ revalidate: ONE_MONTH_IN_SEC, expire: ONE_MONTH_IN_SEC });

  return getLatestExtension();
};
