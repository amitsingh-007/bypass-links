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
  const response = await cache.match(url);
  if (!response) {
    await cache.add(url);
  }
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

export const deleteAllCache = (bucketKeys: ECacheBucketKeys[]) => {
  bucketKeys.forEach(async (cacheBucketKey) => {
    await deleteCache(cacheBucketKey);
  });
  console.log('Cleared all cache inside the buckets', bucketKeys);
};

export const isCachePresent = async (key: string) => {
  const cacheKeys = await caches.keys();
  return cacheKeys.includes(key);
};
