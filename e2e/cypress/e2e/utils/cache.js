export const clearServiceWorkerCache = () => {
  return window.caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log(cacheName);
        return window.caches.delete(cacheName);
      })
    );
  });
};
