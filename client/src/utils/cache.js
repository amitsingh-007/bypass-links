export const getCacheObj = async (cacheBucketKey) =>
  await caches.open(cacheBucketKey);

export const addToCache = async (cache, url) => {
  if (!url) {
    return;
  }
  const response = await cache.match(url);
  if (!response) {
    cache.add(url);
  }
};

export const getFromCache = async (cache, url) => {
  const response = await cache.match(url);
  if (!response || !response.blob) {
    return;
  }
  return await response.blob();
};

export const deleteAllCache = async (bucketKeys) => {
  bucketKeys.forEach(async (cacheBucketKey) => {
    const cache = await getCacheObj(cacheBucketKey);
    const keys = await cache.keys();
    keys.forEach(async (key) => {
      await cache.delete(key);
    });
  });
  console.log("Cleared all cache inside the buckets", bucketKeys);
};
