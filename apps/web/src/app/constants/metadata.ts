import { type Metadata } from 'next';

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  follow: false,
  index: false,
};
