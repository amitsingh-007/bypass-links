export const launchAuthFlow = async () => {
  const { token: accessToken } = await chrome.identity.getAuthToken({
    interactive: true,
  });

  return accessToken ?? null;
};
