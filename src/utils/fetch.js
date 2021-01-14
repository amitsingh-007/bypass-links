export const fetchApi = (url, { responseType = "json", ...init }) =>
  fetch(url, init).then((response) => {
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
