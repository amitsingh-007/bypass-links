import pLimit from 'p-limit';
import wretch from 'wretch';

import { type ECacheBucketKeys } from '../constants/cache';

const limit = pLimit(20);

/**
 * Memoized on the promise, not the Cache: every favicon/avatar mount would
 * otherwise pay its own `caches.open`. Rejections evict themselves so a
 * transient failure isn't cached for the document lifetime.
 */
const cacheObjPromises = new Map<string, Promise<Cache>>();

export const getCacheObj = async (cacheBucketKey: string) => {
  const pending = cacheObjPromises.get(cacheBucketKey);
  if (pending) {
    return pending;
  }
  const promise = caches.open(cacheBucketKey).catch((error: unknown) => {
    cacheObjPromises.delete(cacheBucketKey);
    throw error;
  });
  cacheObjPromises.set(cacheBucketKey, promise);
  return promise;
};

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

/** One blob url per url; `createObjectURL` pins its blob for the document lifetime. */
const blobUrlCache = new Map<string, string>();

const revokeBlobUrl = (url: string) => {
  const blobUrl = blobUrlCache.get(url);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  blobUrlCache.delete(url);
};

/** Drop one entry, for when its underlying cached bytes are replaced. */
export const evictBlobUrl = (url?: string) => {
  if (url) {
    revokeBlobUrl(url);
  }
};

/** Variant taking an already-open Cache, to open the bucket once for many urls. */
export const getBlobUrlFromOpenCache = async (cache: Cache, url?: string) => {
  if (!url) {
    return '';
  }
  const existing = blobUrlCache.get(url);
  if (existing) {
    return existing;
  }
  const response = await cache.match(url);
  const blob = await response?.blob();
  if (!blob) {
    return '';
  }
  const blobUrl = URL.createObjectURL(blob);
  blobUrlCache.set(url, blobUrl);
  return blobUrl;
};

export const getBlobUrlFromCache = async (
  cacheBucketKey: ECacheBucketKeys,
  url: string
) => {
  // Checked before opening the bucket, so a memoized blob url costs nothing
  if (!url) {
    return '';
  }
  const existing = blobUrlCache.get(url);
  if (existing) {
    return existing;
  }
  return getBlobUrlFromOpenCache(await getCacheObj(cacheBucketKey), url);
};

export const deleteCache = async (bucketKey: string) => {
  const cache = await getCacheObj(bucketKey);
  const keys = await cache.keys();
  keys.forEach((request) => revokeBlobUrl(request.url));
  await caches.delete(bucketKey);
  // Otherwise the memo would hand out a handle to the deleted bucket
  cacheObjPromises.delete(bucketKey);
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
