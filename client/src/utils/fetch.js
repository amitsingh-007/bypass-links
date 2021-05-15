export const fetchApi = (url, options = {}) => {
  const { responseType = "json", ...init } = options;
  const fetchUrl = `${HOST_NAME}${url}`;
  return fetch(fetchUrl, init).then((response) => {
    if (!response.ok) {
      throw response;
    }
    switch (responseType) {
      case "json":
        return response.json();
      case "blob":
        return response.blob();
      case "none":
        return response;
      default:
        return response.text();
    }
  });
};
