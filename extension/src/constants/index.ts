import { FIREBASE_DB_REF } from "@common/constants/firebase";

export enum EXTENSION_STATE {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const STORAGE_KEYS = {
  bookmarks: FIREBASE_DB_REF.bookmarks,
  bypass: "bypass",
  hasPendingPersons: "hasPendingPersons",
  lastVisited: "lastVisited",
  personImageUrls: "personImageUrls",
  persons: "persons",
  shortcuts: "shortcuts",
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

export const defaultBookmarkFolder = "Bookmarks bar";
