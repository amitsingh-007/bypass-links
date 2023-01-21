import { ObjectValues } from '../interfaces/utilityTypes';

export const CACHE_BUCKET_KEYS = {
  favicon: 'favicon-cache',
  person: 'person-cache',
} as const;

export type ICacheBucketKeys = ObjectValues<typeof CACHE_BUCKET_KEYS>;
