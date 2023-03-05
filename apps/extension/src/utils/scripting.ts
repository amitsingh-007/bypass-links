import Logging from '@/logging';
import { getCurrentTab } from './tabs';

const getExecuteScriptError = async (
  err: unknown,
  options: chrome.scripting.ScriptInjection<any, any>
) => {
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
    instantUrl: (await getCurrentTab())?.url,
    method: 'executeScript()',
  };
};

const executeScript = (async (options) => {
  try {
    return await chrome.scripting.executeScript(options);
  } catch (e) {
    const errorObj = await getExecuteScriptError(e, options);
    throw errorObj;
  }
}) satisfies typeof chrome.scripting.executeScript;

const scripting = {
  executeScript,
};

export default scripting;
