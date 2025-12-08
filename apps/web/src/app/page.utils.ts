import { getLatestExtension } from '@bypass/trpc/edge';
import { cacheLife, cacheTag } from 'next/cache';
import 'server-only';

export const fetchExtensionData = async () => {
  'use cache';
  cacheTag('extensions-release-cache');
  cacheLife({ revalidate: 60 });

  return getLatestExtension();
};
