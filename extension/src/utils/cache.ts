export const getCacheObj = async (cacheBucketKey: string) =>
  await caches.open(cacheBucketKey);

export const addToCache = async (cacheBucketKey: string, url: string) => {
  if (!url) {
    return;
  }
  const cache = await getCacheObj(cacheBucketKey);
  const response = await cache.match(url);
  if (!response) {
    await cache.add(url);
  }
};

export const getFromCache = async (cacheBucketKey: string, url: string) => {
  const cache = await getCacheObj(cacheBucketKey);
  return await cache.match(url);
};

export const getBlobUrlFromCache = async (
  cacheBucketKey: string,
  url: string
) => {
  const response = await getFromCache(cacheBucketKey, url);
  const blob = await response?.blob();
  if (!blob) {
    return "";
  }
  return URL.createObjectURL(blob);
};

export const deleteAllCache = async (bucketKeys: string[]) => {
  bucketKeys.forEach(async (cacheBucketKey) => {
    const cache = await getCacheObj(cacheBucketKey);
    const keys = await cache.keys();
    keys.forEach(async (key) => {
      await cache.delete(key);
    });
  });
  console.log("Cleared all cache inside the buckets", bucketKeys);
};
