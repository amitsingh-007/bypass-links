import { getLatestExtension } from '@bypass/trpc/edge';
import { unstable_cache } from 'next/cache';
import 'server-only';

export const fetchExtensionData = unstable_cache(
  async () => {
    const { extension, date, version } = await getLatestExtension();

    return {
      downloadLink: extension,
      releaseDate: date,
      extVersion: version,
    };
  },
  [],
  { revalidate: PROD_ENV ? 5 : 60 }
);
