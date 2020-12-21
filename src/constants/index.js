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

const dbPrefix = __PROD__ ? "prod" : "dev";

export const FIREBASE_DB_REF = {
  redirections: `${dbPrefix}/redirections`,
  bookmarks: `${dbPrefix}/bookmarks`,
  bypass: `${dbPrefix}/bypass`,
};
