/** `Object.entries` first, so callers can pass an interface without an index signature. */
export const toQueryString = (params: object) =>
  new URLSearchParams(Object.entries(params)).toString();
