import { IRedirection } from '@bypass/shared';
import { DEFAULT_RULE_ALIAS } from '../constants';

export const getValidRules = (obj: IRedirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

export const isMatchingRule = (rule: IRedirection, searchText: string) => {
  if (!searchText) {
    return false;
  }
  return [rule.alias, rule.website].some((value) =>
    value.toLowerCase().includes(searchText.toLowerCase())
  );
};
