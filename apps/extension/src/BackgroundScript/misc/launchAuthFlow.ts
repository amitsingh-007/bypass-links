const getChromeAccessToken = async () => {
  const { token: accessToken } = await chrome.identity.getAuthToken({
    interactive: true,
  });

  return accessToken;
};

const getFirefoxAccessToken = async () => {
  const manifest = chrome.runtime.getManifest();

  const url = new URL('https://accounts.google.com/o/oauth2/auth');
  url.searchParams.set('client_id', manifest.oauth2?.client_id ?? '');
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
  url.searchParams.set('scope', manifest.oauth2?.scopes?.join(' ') ?? '');

  const redirectedTo = await chrome.identity.launchWebAuthFlow({
    url: url.toString(),
    interactive: true,
  });

  if (!redirectedTo) {
    return null;
  }

  const parsedUrl = new URL(redirectedTo);
  const params = new URLSearchParams(parsedUrl.hash.slice(1));
  return params.get('access_token');
};

export const launchAuthFlow = async () => {
  const accessToken =
    process.env.NEXT_PUBLIC_IS_CHROME === 'true'
      ? await getChromeAccessToken()
      : await getFirefoxAccessToken();

  if (process.env.NEXT_PUBLIC_IS_CHROME !== 'true') {
    localStorage.setItem('access_token', accessToken ?? '');
  }

  return accessToken ?? null;
};
