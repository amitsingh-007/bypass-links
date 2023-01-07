try {
  importScripts('js/runtime.js', 'js/common_chunk.js', 'js/background.js');
  self.__SW_INITIALIZED__ = true;
} catch (error) {
  console.error(error);
}
