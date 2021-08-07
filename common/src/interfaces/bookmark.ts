export type IBookmarkUrl = Record<
  string,
  {
    url: string;
    title: string;
    parentId: string;
    taggedPersons: string[] | null;
  }
>;

export type IFolder = Record<string, { name: string; parentId?: string }>;

export type IFolderMeta = Record<
  string,
  {
    contentId: string;
    isFolder: boolean;
    priority: number;
  }[]
>;

export type IBookmarks = {
  urls: IBookmarkUrl | null;
  folders: IFolder | null;
  foldersMeta: IFolderMeta | null;
};
