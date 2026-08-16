import { type IRedirection, matchesText } from '@bypass/shared';

import { DEFAULT_RULE_ALIAS } from '../constants';

export const getValidRules = (obj: IRedirection) =>
  Boolean(obj?.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

/** Returns false on empty text: rows stay mounted and are hidden by CSS. */
export const isMatchingRule = (rule: IRedirection, searchText: string) =>
  Boolean(searchText) && matchesText(searchText, rule.alias, rule.website);
