(async () => {
  const files = [
    './js/runtime.js',
    './js/common_chunk.js',
    './js/background.js',
  ];
  for (const file of files) {
    await import(file);
  }
  window.SW_INITIALIZED = true;
})();
