export const clearServiceWorkerCache = () => {
  console.log("called");
  return window.caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log(cacheName);
        return window.caches.delete(cacheName);
      })
    );
  });
};
