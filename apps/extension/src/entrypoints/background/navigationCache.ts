import { STORAGE_KEYS } from '@bypass/shared';

import { type EExtensionState, EExtStorageKey } from '@/constants';
import { extStateItem, mappedRedirectionsItem } from '@/storage/items';

import { type IMappedRedirections } from './interfaces/redirections';

/**
 * Background-only: the popup bundle gets its own copy the worker never writes
 * to. Refilled lazily since MV3 tears down module state with the worker.
 */
let extState: EExtensionState | undefined;
let mappedRedirections: IMappedRedirections | undefined;

export const getExtState = async () => {
  extState ??= await extStateItem.getValue();
  return extState;
};

export const getMappedRedirections = async () => {
  mappedRedirections ??= await mappedRedirectionsItem.getValue();
  return mappedRedirections;
};

/** Written from the popup realm, so storage events are the only signal. */
export const invalidateNavigationCache = (changes: Record<string, unknown>) => {
  if (EExtStorageKey.EXT_STATE in changes) {
    extState = undefined;
  }
  if (STORAGE_KEYS.mappedRedirections in changes) {
    mappedRedirections = undefined;
  }
};
