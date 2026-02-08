import { type IRedirections } from '@bypass/shared';
import { type IMappedRedirections } from '../interfaces/redirections';

export const mapRedirections = (
  redirections: IRedirections
): IMappedRedirections =>
  redirections?.reduce<IMappedRedirections>((obj, { alias, website }) => {
    obj[alias] = website;
    return obj;
  }, {});
