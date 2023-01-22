try {
  importScripts('js/runtime.js', 'js/common_chunk.js', 'js/background.js');
  self.SW_INITIALIZED = true;
} catch (error) {
  console.error(error);
}
