import promisify from './promisifyChromeApi';

const scripting = {
  executeScript: (options: chrome.scripting.ScriptInjection<any, any>) =>
    promisify<chrome.scripting.InjectionResult<any>[]>((callback?: any) => {
      chrome.scripting.executeScript(options, callback);
    }),
};

export default scripting;
