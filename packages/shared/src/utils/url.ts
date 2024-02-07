export const serializeObjectToQueryString = (urlParams: Record<string, any>) =>
  new URLSearchParams(urlParams).toString();

export const deserializeQueryStringToObject = (queryString: string) =>
  Object.fromEntries(new URLSearchParams(queryString));
