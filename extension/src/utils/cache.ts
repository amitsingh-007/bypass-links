import { CACHE_BUCKET_KEYS } from 'GlobalConstants/cache';

export const getCacheObj = async (cacheBucketKey: string) =>
  await caches.open(cacheBucketKey);

export const addToCache = async (
  cacheBucketKey: CACHE_BUCKET_KEYS,
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

const getFromCache = async (cacheBucketKey: CACHE_BUCKET_KEYS, url: string) => {
  const cache = await getCacheObj(cacheBucketKey);
  return await cache.match(url);
};

export const getBlobUrlFromCache = async (
  cacheBucketKey: CACHE_BUCKET_KEYS,
  url: string
) => {
  const response = await getFromCache(cacheBucketKey, url);
  const blob = await response?.blob();
  if (!blob) {
    return '';
  }
  return URL.createObjectURL(blob);
};

export const deleteAllCache = async (bucketKeys: CACHE_BUCKET_KEYS[]) => {
  bucketKeys.forEach(async (cacheBucketKey) => {
    const cache = await getCacheObj(cacheBucketKey);
    const keys = await cache.keys();
    keys.forEach(async (key) => {
      await cache.delete(key);
    });
  });
  console.log('Cleared all cache inside the buckets', bucketKeys);
};
