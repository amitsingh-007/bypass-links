const promisify = <T>(block: Function) =>
  new Promise<T>((resolve, reject) => {
    block((...results: [T]) => {
      const errorMsg = chrome.runtime.lastError?.message;
      if (!errorMsg) {
        resolve(...results);
      }
      if (errorMsg === "The tab was closed.") {
        resolve({} as T);
      } else {
        reject({ message: errorMsg, func: block.toString() });
      }
    });
  });

export default promisify;
