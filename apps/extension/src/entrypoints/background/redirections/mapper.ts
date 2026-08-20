import { type IRedirections } from '@bypass/shared';

import { type IMappedRedirections } from '../interfaces/redirections';

export const mapRedirections = (
  redirections: IRedirections
): IMappedRedirections =>
  Object.fromEntries(
    redirections.map(({ alias, website }) => [alias, website])
  );
