import { useEffect, useState } from 'react';
import type { WxtStorageItem } from 'wxt/utils/storage';

import { extStateItem, historyStartTimeItem } from './items';

const useStorageItem = <T extends string | number | boolean | null>(
  item: WxtStorageItem<T, {}>
) => {
  const [value, setValue] = useState(item.fallback);
  useEffect(() => {
    let changed = false;
    const unwatch = item.watch((nextValue) => {
      changed = true;
      setValue(nextValue);
    });
    void item
      .getValue()
      .then((initialValue) => {
        if (!changed) setValue(initialValue);
      })
      .catch(console.error);
    return () => {
      changed = true;
      unwatch();
    };
  }, [item]);
  return value;
};

export const useExtensionState = () => useStorageItem(extStateItem);
export const useHistoryStartTime = () => useStorageItem(historyStartTimeItem);
