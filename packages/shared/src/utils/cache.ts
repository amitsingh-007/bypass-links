import wretch from 'wretch';
import { type ECacheBucketKeys } from '../constants/cache';

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
  await Promise.all(
    uniqueUrls.map(async (url) => addToCache(cacheBucketKey, url))
  );
};

const getFromCache = async (cacheBucketKey: ECacheBucketKeys, url: string) => {
  const cache = await getCacheObj(cacheBucketKey);
  return cache.match(url);
};

export const getBlobUrlFromCache = async (
  cacheBucketKey: ECacheBucketKeys,
  url: string
) => {
  const response = await getFromCache(cacheBucketKey, url);
  const blob = await response?.blob();
  if (!blob) {
    return '';
  }
  return URL.createObjectURL(blob);
};

export const deleteCache = async (bucketKey: string) => {
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
