const promisify = (block) => {
  return new Promise((resolve, reject) => {
    block((...results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.extension.lastError);
      } else {
        resolve(...results);
      }
    });
  });
};

export default promisify;
