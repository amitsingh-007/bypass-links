import { ILogRequest } from '@bypass/trpc';
import { api } from './utils/api';

class Logging {
  static stringifyError = (e?: Object) =>
    JSON.stringify(e, Object.getOwnPropertyNames(e));

  static sendToLog = async (data: { message: any; metaData: any }) => {
    try {
      const { version } = chrome.runtime.getManifest();
      data.metaData.manifestVersion = version;
      const log: ILogRequest = {
        app: 'extension',
        isProd: PROD_ENV,
        level: 'error',
        url: globalThis.location.href,
        message: data.message ?? 'ERROR_MESSAGE_NOT_FOUND',
        metaData: data.metaData,
      };
      await api.logging.log.mutate(log);
    } catch (e) {
      console.error('Error while sending log to server', e);
    }
  };

  static logErrors = () => {
    globalThis.onerror = (errorMsg, url, line, column, error) => {
      Logging.sendToLog({
        message: errorMsg,
        metaData: {
          error: Logging.stringifyError(error),
          url,
          line,
          column,
          type: 'exception',
        },
      });
      return false;
    };

    globalThis.onunhandledrejection = (error) => {
      const { reason } = error;
      Logging.sendToLog({
        message:
          typeof reason === 'object' ? Logging.stringifyError(reason) : reason,
        metaData: {
          error: Logging.stringifyError(error),
          type: 'promiseRejection',
        },
      });
    };
  };
}

export default Logging;
