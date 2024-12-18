import { IRedirection } from '@bypass/shared';
import { DEFAULT_RULE_ALIAS } from '../constants';

export const getValidRules = (obj: IRedirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);
