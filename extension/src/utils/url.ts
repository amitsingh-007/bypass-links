import { GenericObject } from "GlobalInterfaces/custom";

export const serialzeObjectToQueryString = (urlParams: GenericObject) =>
  new URLSearchParams(urlParams).toString();

export const deserialzeQueryStringToObject = (queryString: string) =>
  Object.fromEntries(new URLSearchParams(queryString));
