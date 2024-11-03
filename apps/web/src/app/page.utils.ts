import { getLatestExtension } from '@bypass/trpc/edge';
import { unstable_cache } from 'next/cache';
import 'server-only';

export const fetchExtensionData = unstable_cache(
  async () => await getLatestExtension(),
  [],
  { revalidate: PROD_ENV ? 5 : 60 }
);
