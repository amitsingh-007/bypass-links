import { getLatestExtension } from '@bypass/trpc/edge';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';
import 'server-only';

export const fetchExtensionData = async () => {
  'use cache';
  cacheTag('extensions-release-cache');
  cacheLife({ revalidate: 60 });

  return getLatestExtension();
};
