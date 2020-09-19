/*eslint-disable*/

export const bypassLinkvertise = (url) => {
  try {
    const base64EncodedTargetUri = url.searchParams.get("r");
    let decodedTargetUri = null;
    if (base64EncodedTargetUri) {
      decodedTargetUri = atob(base64EncodedTargetUri);
    }
    return decodedTargetUri;
  } catch (ex) {
    return null;
  }
};
