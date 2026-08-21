import pLimit from 'p-limit';
import wretch from 'wretch';

import { type ECacheBucketKeys } from '../constants/cache';

const limit = pLimit(20);

const addToOpenCache = async (cache: Cache, url: string) => {
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    return;
  }
  try {
    const response = await wretch(url).get().res();
    await cache.put(url, response);
  } catch (error) {
    if (error instanceof Error) {
      console.debug('Failed to cache favicon:', url, error.message);
    }
  }
};

export const addToCache = async (
  cacheBucketKey: ECacheBucketKeys,
  url: string
) => {
  if (!url) {
    return;
  }
  await addToOpenCache(await caches.open(cacheBucketKey), url);
};

export const addAllToCache = async (
  cacheBucketKey: ECacheBucketKeys,
  urls: string[]
) => {
  const cache = await caches.open(cacheBucketKey);
  const uniqueUrls = [...new Set(urls)].filter(Boolean);
  const cachePromises = uniqueUrls.map(async (url) =>
    limit(async () => addToOpenCache(cache, url))
  );
  await Promise.all(cachePromises);
};

/** One blob url per url; `createObjectURL` pins its blob for the document lifetime. */
const blobUrlCache = new Map<string, string>();

export const evictBlobUrl = (url?: string) => {
  if (!url) {
    return;
  }
  const blobUrl = blobUrlCache.get(url);
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  blobUrlCache.delete(url);
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
) =>
  blobUrlCache.get(url) ??
  getBlobUrlFromOpenCache(await caches.open(cacheBucketKey), url);

export const deleteCache = async (bucketKey: string) => {
  const cache = await caches.open(bucketKey);
  const keys = await cache.keys();
  keys.forEach((request) => evictBlobUrl(request.url));
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
