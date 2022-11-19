export interface IBookmark {
  url: string;
  title: string;
  parentHash: string;
  taggedPersons: string[];
}

interface IFolder {
  name: string;
  parentHash: string;
}

export interface IFolderMetaData {
  isDir: boolean;
  hash: string;
}

export interface IBookmarksObj {
  folderList: {
    [foldername_hash: string]: IFolder;
  };
  urlList: {
    [url_hash: string]: IBookmark;
  };
  folders: {
    [foldername_hash: string]: IFolderMetaData[];
  };
}

export type ISelectedBookmarks = boolean[];

export type ContextBookmark = Partial<
  Pick<IFolder, 'name'> & Omit<IBookmark, 'parentHash'>
> & {
  isDir: boolean;
};

export type ContextBookmarks = ContextBookmark[];
