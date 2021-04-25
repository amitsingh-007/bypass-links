import { addToCache } from "GlobalUtils/cache";
import { getFaviconUrl } from "../utils";

//Resolve and map content into req format
export const bookmarksMapper = (
  [_key, { isDir, hash }],
  urlList,
  folderList,
  cache
) => {
  const obj = { isDir };
  const content = isDir ? folderList[hash] : urlList[hash];
  if (isDir) {
    obj.name = atob(content.name);
  } else {
    obj.url = decodeURIComponent(atob(content.url));
    obj.title = decodeURIComponent(atob(content.title));
    obj.taggedPersons = content.taggedPersons || [];
  }
  //To preload images on client side runtime
  addToCache(cache, obj.url && getFaviconUrl(obj.url));
  return obj;
};
