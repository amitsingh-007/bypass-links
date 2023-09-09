export interface IEncodedBookmark {
  url: string;
  title: string;
  parentHash: string;
  taggedPersons: string[];
}

export interface IEncodedFolder {
  name: string;
  parentHash: string;
  isDefault?: boolean;
}

export interface IFolderMetaData {
  isDir: boolean;
  hash: string;
}

export interface IDecodedBookmark {
  isDir: false;
  url: string;
  title: string;
  taggedPersons: string[];
}

export interface IDecodedFolder {
  isDir: true;
  name: string;
  isDefault: boolean;
}

export type ContextBookmark = IDecodedBookmark | IDecodedFolder;

export type ContextBookmarks = ContextBookmark[];

export interface IBookmarksObj {
  folderList: {
    [foldername_hash: string]: IEncodedFolder;
  };
  urlList: {
    [url_hash: string]: IEncodedBookmark;
  };
  folders: {
    [foldername_hash: string]: IFolderMetaData[];
  };
}

export type ISelectedBookmarks = boolean[];
