import { type Metadata } from 'next';

/**
 * The panels are signed-in surfaces. Stated once so a new one cannot quietly
 * ship without it.
 */
export const NOINDEX_ROBOTS: Metadata['robots'] = {
  follow: false,
  index: false,
};
