import { IMappedRedirections, IRedirection } from "../interfaces/redirections";

export const mapRedirections = (
  redirections: IRedirection[]
): IMappedRedirections =>
  redirections &&
  redirections.reduce<IMappedRedirections>((obj, { alias, website }) => {
    obj[alias] = website;
    return obj;
  }, {});
