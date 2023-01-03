interface IOptions extends RequestInit {
  responseType?: string;
}

export const fetchApi = <T = any>(
  url: string,
  options?: IOptions
): Promise<T> => {
  const { responseType = 'json', ...init } = options || {};
  const fetchUrl = `${HOST_NAME}${url}`;
  return fetch(fetchUrl, init).then((response) => {
    if (!response.ok) {
      throw response;
    }
    let res: any;
    switch (responseType) {
      case 'json':
        res = response.json();
        break;
      case 'blob':
        res = response.blob();
        break;
      case 'none':
        res = response;
        break;
      default:
        res = response.text();
    }
    return res as Promise<T>;
  });
};
