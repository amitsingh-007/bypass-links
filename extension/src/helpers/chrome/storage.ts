import { GenericObject } from 'GlobalInterfaces/custom';
import promisify from './promisifyChromeApi';

const storage = {
  set: (items: Object) =>
    promisify<void>((callback?: any) => {
      chrome.storage.local.set(items, callback);
    }),

  get: (keys: string | string[] | Object | null) =>
    promisify<GenericObject>((callback: any) => {
      chrome.storage.local.get(keys, callback);
    }),

  remove: (keys: string | string[]) =>
    promisify<void>((callback: any) => {
      chrome.storage.local.remove(keys, callback);
    }),
};

export default storage;
