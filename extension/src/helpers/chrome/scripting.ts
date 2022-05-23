import promisify from './promisifyChromeApi';

const scripting = {
  executeScript: (options: chrome.scripting.ScriptInjection) =>
    promisify<chrome.scripting.InjectionResult[]>((callback?: any) => {
      chrome.scripting.executeScript(options, callback);
    }),
};

export default scripting;
