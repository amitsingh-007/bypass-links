import pLimit from 'p-limit';
import wretch from 'wretch';

import { type ECacheBucketKeys } from '../constants/cache';

const limit = pLimit(20);

export const getCacheObj = async (cacheBucketKey: string) =>
  caches.open(cacheBucketKey);

export const addToCache = async (
  cacheBucketKey: ECacheBucketKeys,
  url: string
) => {
  if (!url) {
    return;
  }
  const cache = await getCacheObj(cacheBucketKey);
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    return;
  }
  try {
    const response = await wretch(url).get().res();
    await cache.put(url, response);
  } catch (error) {
    // Ignore favicons (404) not found
    if (error instanceof Error) {
      console.debug('Failed to cache favicon:', url, error.message);
    }
  }
};

export const addAllToCache = async (
  cacheBucketKey: ECacheBucketKeys,
  urls: string[]
) => {
  const uniqueUrls = [...new Set(urls)];
  const cachePromises = uniqueUrls.map(async (url) =>
    limit(async () => addToCache(cacheBucketKey, url))
  );
  await Promise.all(cachePromises);
};

/**
 * One blob url per cached entry. `URL.createObjectURL` pins its blob for the
 * document lifetime and nothing revokes it, so minting a fresh url per call
 * leaked a copy per render in the long-lived web document. Keyed by bucket as
 * well as url, since the same url could live in more than one bucket and
 * eviction is per bucket.
 */
const blobUrlCache = new Map<string, string>();

const blobUrlKey = (cacheBucketKey: string, url: string) =>
  `${cacheBucketKey}:${url}`;

const evictBlobUrls = (cacheBucketKey: string) => {
  const prefix = `${cacheBucketKey}:`;
  for (const key of blobUrlCache.keys()) {
    if (key.startsWith(prefix)) {
      const blobUrl = blobUrlCache.get(key);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      blobUrlCache.delete(key);
    }
  }
};

/** Drop one entry, for when its underlying cached bytes are replaced. */
export const evictBlobUrl = (cacheBucketKey: string, url?: string) => {
  if (!url) {
    return;
  }
  const key = blobUrlKey(cacheBucketKey, url);
  const blobUrl = blobUrlCache.get(key);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  blobUrlCache.delete(key);
};

/** Variant taking an already-open Cache, to open the bucket once for many urls. */
export const getBlobUrlFromOpenCache = async (
  cacheBucketKey: ECacheBucketKeys,
  cache: Cache,
  url?: string
) => {
  if (!url) {
    return '';
  }
  const key = blobUrlKey(cacheBucketKey, url);
  const existing = blobUrlCache.get(key);
  if (existing) {
    return existing;
  }
  const response = await cache.match(url);
  const blob = await response?.blob();
  if (!blob) {
    return '';
  }
  const blobUrl = URL.createObjectURL(blob);
  blobUrlCache.set(key, blobUrl);
  return blobUrl;
};

export const getBlobUrlFromCache = async (
  cacheBucketKey: ECacheBucketKeys,
  url: string
) =>
  getBlobUrlFromOpenCache(
    cacheBucketKey,
    await getCacheObj(cacheBucketKey),
    url
  );

export const deleteCache = async (bucketKey: string) => {
  evictBlobUrls(bucketKey);
  await caches.delete(bucketKey);
};

export const deleteAllCache = async (cacheBucketKeys: ECacheBucketKeys[]) => {
  await Promise.all(
    cacheBucketKeys.map(async (cacheBucketKey) => deleteCache(cacheBucketKey))
  );
  console.log('Cleared all cache inside the buckets', cacheBucketKeys);
};

export const isCachePresent = async (key: string) => {
  const cacheKeys = await caches.keys();
  return cacheKeys.includes(key);
};
