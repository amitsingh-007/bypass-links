import { type EExtensionState } from '@/constants';
import { extStateItem } from '@/storage/items';

/**
 * Background-only: the popup bundle gets its own copy the worker never writes
 * to. Refilled lazily since MV3 tears down module state with the worker.
 */
let extState: EExtensionState | undefined;

export const getExtState = async () => {
  if (extState === undefined) {
    const value = await extStateItem.getValue();
    extState ??= value;
  }
  return extState;
};

export const setExtState = (value: EExtensionState) => {
  extState = value;
};
