export const bypassBonsai = async (url) => {
  const encodedTargetUrl = url.searchParams.get("adsurlkkk");
  if (encodedTargetUrl) {
    return atob(encodedTargetUrl);
  }
  return null;
};
