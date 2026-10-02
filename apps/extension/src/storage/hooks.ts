import { useSyncExternalStore } from 'react';
import type { WxtStorageItem } from 'wxt/utils/storage';

import { extStateItem, historyStartTimeItem } from './items';

const createStorageHook = <T extends string | number | boolean | null>(
  item: WxtStorageItem<T, {}>
) => {
  let snapshot = item.fallback;
  let revision = 0;
  let unwatch: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const getSnapshot = () => snapshot;
  const update = (value: T) => {
    if (Object.is(snapshot, value)) {
      return;
    }
    snapshot = value;
    listeners.forEach((listener) => listener());
  };
  const reportError = (error: unknown) => {
    console.error(`Could not read ${item.key}`, error);
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      let active = true;
      const readRevision = revision;
      try {
        const stopWatch = item.watch((value) => {
          if (active) {
            revision++;
            update(value);
          }
        });
        unwatch = () => {
          active = false;
          stopWatch();
          snapshot = item.fallback;
        };
        void item
          .getValue()
          .then((value) => {
            if (active && revision === readRevision) {
              update(value);
            }
          })
          .catch(reportError);
      } catch (error) {
        reportError(error);
      }
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        unwatch?.();
        unwatch = undefined;
      }
    };
  };

  return () => useSyncExternalStore(subscribe, getSnapshot);
};

export const useExtensionState = createStorageHook(extStateItem);
export const useHistoryStartTime = createStorageHook(historyStartTimeItem);
