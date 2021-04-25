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
    const cache = await caches.open(cacheBucketKey);
    const keys = await cache.keys();
    keys.forEach(async (key) => {
      const isDeleted = await cache.delete(key);
      console.log(isDeleted);
    });
  });
  console.log("Cleared all cache inside the buckets", bucketKeys);
};
