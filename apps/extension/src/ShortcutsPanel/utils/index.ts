import { IRedirection } from '@/BackgroundScript/interfaces/redirections';
import { DEFAULT_RULE_ALIAS } from '../constants';

export const getValidRules = (obj: IRedirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

export const getRedirectionId = (redirection: IRedirection) =>
  `${redirection.alias}_${redirection.website}`;
