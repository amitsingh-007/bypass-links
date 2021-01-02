const promisify = (block) =>
  new Promise((resolve, reject) => {
    block((...results) => {
      const errorMsg = chrome.runtime.lastError?.message;
      if (errorMsg) {
        if (errorMsg === "The tab was closed.") {
          resolve();
        } else {
          reject({ message: errorMsg, func: block.toString() });
        }
      } else {
        resolve(...results);
      }
    });
  });

export default promisify;
