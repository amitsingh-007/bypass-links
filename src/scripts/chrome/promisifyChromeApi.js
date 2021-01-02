const promisify = (block) => {
  return new Promise((resolve, reject) => {
    block((...results) => {
      if (chrome.runtime.lastError) {
        if (chrome.runtime.lastError.message === "The tab was closed.") {
          resolve();
        } else {
          reject(chrome.extension.lastError);
        }
      } else {
        resolve(...results);
      }
    });
  });
};

export default promisify;
