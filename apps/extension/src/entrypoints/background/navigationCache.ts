import { type EExtensionState } from '@/constants';
import { extStateItem, mappedRedirectionsItem } from '@/storage/items';

import { type IMappedRedirections } from './interfaces/redirections';

/**
 * Background-only: the popup bundle gets its own copy the worker never writes
 * to. Refilled lazily since MV3 tears down module state with the worker.
 */
let extState: EExtensionState | undefined;
let mappedRedirections: IMappedRedirections | undefined;

export const getExtState = async () => {
  if (extState === undefined) {
    const value = await extStateItem.getValue();
    extState ??= value;
  }
  return extState;
};

export const getMappedRedirections = async () => {
  if (mappedRedirections === undefined) {
    const value = await mappedRedirectionsItem.getValue();
    mappedRedirections ??= value;
  }
  return mappedRedirections;
};

export const setExtState = (value: EExtensionState) => {
  extState = value;
};

export const setMappedRedirections = (value: IMappedRedirections) => {
  mappedRedirections = value;
};
