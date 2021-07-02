export const getCacheObj = async (cacheBucketKey) =>
  await caches.open(cacheBucketKey);

export const addToCache = async (cacheBucketKey, url) => {
  if (!url) {
    return;
  }
  const cache = await getCacheObj(cacheBucketKey);
  const response = await cache.match(url);
  if (!response) {
    await cache.add(url);
  }
};

export const getFromCache = async (cacheBucketKey, url) => {
  const cache = await getCacheObj(cacheBucketKey);
  const response = await cache.match(url);
  if (!response || !response.blob) {
    return;
  }
  return await response.blob();
};

export const getBlobUrlFromCache = async (cacheBucketKey, url) => {
  const blob = await getFromCache(cacheBucketKey, url);
  return blob && URL.createObjectURL(blob);
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
