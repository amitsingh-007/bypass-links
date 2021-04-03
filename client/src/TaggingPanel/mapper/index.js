export const decryptionMapper = ([
  _key,
  { uid, name, imageRef, taggedUrls },
]) => ({
  uid,
  name: atob(name),
  imageRef: atob(imageRef),
  taggedUrls,
});
