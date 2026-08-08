import { STORAGE_KEYS } from '@bypass/shared';

import { type EExtensionState, EExtStorageKey } from '@/constants';
import { extStateItem, mappedRedirectionsItem } from '@/storage/items';

import { type IMappedRedirections } from './interfaces/redirections';

/**
 * Background-only. The popup bundle would get its own copy of these
 * variables, so importing this outside the service worker gives you a cache
 * the worker never writes to — invalidation only travels via storage events.
 *
 * MV3 tears the worker down, taking module state with it, so each getter
 * refills lazily rather than being primed at startup.
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

/**
 * Both values are written from the popup realm (sign-in sync, rule save), so
 * storage events are the only cross-context signal the worker can trust.
 */
export const invalidateNavigationCache = (changes: Record<string, unknown>) => {
  if (EExtStorageKey.EXT_STATE in changes) {
    extState = undefined;
  }
  if (STORAGE_KEYS.mappedRedirections in changes) {
    mappedRedirections = undefined;
  }
};
