import { FIREBASE_DB_REF } from "@common/constants/firebase";

export const LINKVERTISE_API_BASE_URL =
  "https://publisher.linkvertise.com/api/v1/redirect/link";

export const MEDIUM_HOMEPAGE = "https://medium.com/";

export const MEDIUM_WHITELISTED = [
  "https://medium.com/@suncommander",
  "https://medium.com/me/",
];

export enum EXTENSION_STATE {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const STORAGE_KEYS = {
  bookmarks: FIREBASE_DB_REF.bookmarks,
  bypass: FIREBASE_DB_REF.bypass,
  redirections: FIREBASE_DB_REF.redirections,
  lastVisited: FIREBASE_DB_REF.lastVisited,
  persons: FIREBASE_DB_REF.persons,
  mappedRedirections: "mappedRedirections",
  personImageUrls: "personImageUrls",
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

export const FIREBASE_STORAGE_REF = {
  persons: STORAGE_KEYS.persons,
};

export const defaultBookmarkFolder = "Bookmarks bar";
