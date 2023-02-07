import { GenericObject } from '../interfaces/custom';

export const serializeObjectToQueryString = (urlParams: GenericObject) =>
  new URLSearchParams(urlParams).toString();

export const deserializeQueryStringToObject = (queryString: string) =>
  Object.fromEntries(new URLSearchParams(queryString));
