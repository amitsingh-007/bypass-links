export const serialzeObjectToQueryString = (urlParams) =>
  new URLSearchParams(urlParams).toString();

export const deserialzeQueryStringToObject = (queryString) =>
  Object.fromEntries(new URLSearchParams(queryString));
