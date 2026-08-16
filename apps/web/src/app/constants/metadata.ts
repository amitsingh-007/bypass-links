import { type Metadata } from 'next';

const NOINDEX_ROBOTS: Metadata['robots'] = {
  follow: false,
  index: false,
};

export const createNoindexMetadata = (title: string): Metadata => ({
  title,
  robots: NOINDEX_ROBOTS,
});
