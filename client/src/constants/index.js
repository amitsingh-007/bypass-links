export const LINKVERTISE_API_BASE_URL =
  "https://publisher.linkvertise.com/api/v1/redirect/link";

export const MEDIUM_HOMEPAGE = "https://medium.com/";

export const MEDIUM_WHITELISTED = [
  "https://medium.com/@suncommander",
  "https://medium.com/me/",
];

export const EXTENSION_STATE = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const STORAGE_KEYS = {
  bookmarks: "bookmarks",
  bypass: "bypass",
  mappedRedirections: "mappedRedirections",
  redirections: "redirections",
  lastVisited: "lastVisited",
  persons: "persons",
  personImages: "personImages",
  userProfile: "userProfile",
};

export const BYPASS_KEYS = {
  LINKVERTISE: "LINKVERTISE",
  LINKVERTISE_DOWNLOAD: "LINKVERTISE_DOWNLOAD",
  BONSAI: "BONSAI",
  BONSAILINK: "BONSAILINK",
  FORUMS: "FORUMS",
  JUSTPASTEIT: "JUSTPASTEIT",
  PASTELINK: "PASTELINK",
  RENTRY: "RENTRY",
  MEDIUM: "MEDIUM",
};

export const FIREBASE_DB_REF = {
  bookmarks: STORAGE_KEYS.bookmarks,
  bypass: STORAGE_KEYS.bypass,
  redirections: STORAGE_KEYS.redirections,
  lastVisited: STORAGE_KEYS.lastVisited,
  persons: STORAGE_KEYS.persons,
};

export const FIREBASE_STORAGE_REF = {
  persons: STORAGE_KEYS.persons,
};

export const defaultBookmarkFolder = "Bookmarks bar";
