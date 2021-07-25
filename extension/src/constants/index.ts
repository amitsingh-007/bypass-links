import { FIREBASE_DB_REF } from "@common/constants/firebase";

export enum EXTENSION_STATE {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const STORAGE_KEYS = {
  bookmarks: FIREBASE_DB_REF.bookmarks,
  bypass: "bypass",
  shortcuts: "shortcuts",
  lastVisited: "lastVisited",
  persons: FIREBASE_DB_REF.persons,
  personImageUrls: "personImageUrls",
  userProfile: "userProfile",
};

export enum BYPASS_KEYS {
  LINKVERTISE = "LINKVERTISE",
  LINKVERTISE_DOWNLOAD = "LINKVERTISE_DOWNLOAD",
  BONSAI = "BONSAI",
  BONSAILINK = "BONSAILINK",
  FORUMS = "FORUMS",
  JUSTPASTEIT = "JUSTPASTEIT",
  PASTELINK = "PASTELINK",
  RENTRY = "RENTRY",
  MEDIUM = "MEDIUM",
}

export const FIREBASE_STORAGE_REF = {
  persons: STORAGE_KEYS.persons,
};

export const defaultBookmarkFolder = "Bookmarks bar";
