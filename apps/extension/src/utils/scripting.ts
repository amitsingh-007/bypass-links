import Logging from '@/logging';
import { getCurrentTab } from './tabs';

const getExecuteScriptError = async (
  err: unknown,
  options: chrome.scripting.ScriptInjection<any, any>
) => {
  const tab = await getCurrentTab();
  const error =
    typeof err === 'object' ? Logging.parseObject(err) : { reason: err };
  const executor =
    'func' in options
      ? Logging.parseObject({
          funcName: options.func.name,
          funcBody: options.func.toString(),
        })
      : {};
  return {
    ...error,
    ...executor,
    instantUrl: tab?.url,
    method: 'executeScript()',
  };
};

const executeScript = (async (options) => {
  try {
    return await chrome.scripting.executeScript(options);
  } catch (error) {
    const errorObj = await getExecuteScriptError(error, options);
    throw errorObj;
  }
}) satisfies typeof chrome.scripting.executeScript;

const scripting = {
  executeScript,
};

export default scripting;
