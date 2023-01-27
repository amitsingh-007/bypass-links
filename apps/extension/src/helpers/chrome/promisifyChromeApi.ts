const IGNORED_ERRORS = ['The tab was closed.', 'Frame with ID 0 was removed.'];

const promisify = <T>(block: Function) =>
  new Promise<T>((resolve, reject) => {
    block((...results: [T]) => {
      const errorMsg = chrome.runtime.lastError?.message;
      if (!errorMsg) {
        resolve(...results);
      } else if (IGNORED_ERRORS.includes(errorMsg)) {
        resolve({} as T);
      } else {
        reject({
          message: errorMsg,
          func: block.toString(),
        });
      }
    });
  });

export default promisify;
