import { IRedirections } from '@bypass/shared';
import { IMappedRedirections } from '../interfaces/redirections';

export const mapRedirections = (
  redirections: IRedirections
): IMappedRedirections =>
  redirections &&
  redirections.reduce<IMappedRedirections>((obj, { alias, website }) => {
    obj[alias] = website;
    return obj;
  }, {});
