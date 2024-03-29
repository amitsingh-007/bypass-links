import { ILogRequest } from '@bypass/trpc';
import { trpcApi } from './apis/trpcApi';
import { getCurrentTab } from './utils/tabs';

class Logging {
  private static errorsToIgnore = [
    'No tab with id',
    'Frame with ID 0 is showing error page',
    'Frame with ID 0 was removed',
  ];

  private static ignoreError = (err: string) => {
    if (typeof err !== 'string') {
      return false;
    }
    return this.errorsToIgnore.some((e) => err.includes(e));
  };

  private static sendToLog = async (data: { message: any; metaData: any }) => {
    try {
      if (this.ignoreError(data.message?.message || data.message)) {
        return;
      }
      const { version } = chrome.runtime.getManifest();
      data.metaData.manifestVersion = version;
      const log: ILogRequest = {
        app: 'extension',
        isProd: PROD_ENV,
        level: 'error',
        url: globalThis.location.href,
        tabUrl: (await getCurrentTab())?.url,
        message: data.message ?? 'ERROR_MESSAGE_NOT_FOUND',
        metaData: data.metaData,
      };
      await trpcApi.logging.log.mutate(log);
    } catch (e) {
      console.error('Error while sending log to server', e);
    }
  };

  static parseObject = (obj?: Object | null) =>
    obj
      ? JSON.parse(JSON.stringify(obj, Object.getOwnPropertyNames(obj)))
      : obj;

  static init = () => {
    globalThis.onerror = (errorMsg, url, line, column, error) => {
      this.sendToLog({
        message: errorMsg,
        metaData: {
          error: this.parseObject(error),
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
      this.sendToLog({
        message: typeof reason === 'object' ? this.parseObject(reason) : reason,
        metaData: {
          error: this.parseObject(error),
          type: 'promiseRejection',
        },
      });
    };
  };
}

export default Logging;
