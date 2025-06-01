import { getBookmarks } from '@helpers/fetchFromStorage';
import {
  ContextBookmarks,
  ECacheBucketKeys,
  IBookmarksObj,
  ITransformedBookmark,
  ISelectedBookmarks,
  addToCache,
  bookmarksMapper,
  getBookmarkId,
  getEncryptedBookmark,
  getFaviconProxyUrl,
  getEncryptedFolder,
} from '@bypass/shared';
import md5 from 'md5';
import { create } from 'zustand';
import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import { processBookmarksMove } from '../utils/manipulate';
import { notifications } from '@mantine/notifications';

interface State {
  // State
  contextBookmarks: ContextBookmarks;
  urlList: IBookmarksObj['urlList'];
  folderList: IBookmarksObj['folderList'];
  folders: IBookmarksObj['folders'];
  selectedBookmarks: ISelectedBookmarks;
  cutBookmarks: ISelectedBookmarks;
  isFetching: boolean;
  isSaveButtonActive: boolean;

  // Actions
  loadData: (folderContext: string) => Promise<void>;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  resetSelectedBookmarks: () => void;
  handleCutBookmarks: () => void;
  handleCreateNewFolder: (name: string, folderContext: string) => void;
  handleBookmarkSave: (
    updatedBookmark: ITransformedBookmark,
    oldFolder: string,
    newFolder: string,
    pos: number
  ) => void;
  handleUrlRemove: (pos: number, url: string) => void;
  handleBulkUrlRemove: () => void;
  handleFolderRename: (oldName: string, newName: string, pos: number) => void;
  handleToggleDefaultFolder: (
    folderName: string,
    newIsDefault: boolean,
    pos: number
  ) => void;
  handleFolderRemove: (pos: number, name: string) => void;
  handleSave: (folderContext: string) => Promise<void>;
  handlePasteSelectedBookmarks: () => void;
}

const useBookmarkStore = create<State>()((set, get) => ({
  contextBookmarks: [],
  urlList: {},
  folderList: {},
  folders: {},
  selectedBookmarks: [],
  cutBookmarks: [],
  isFetching: true,
  isSaveButtonActive: false,
  updateTaggedPersons: [],

  loadData: async (folderContext: string) => {
    set({ isSaveButtonActive: false, isFetching: true });
    const { folders, urlList, folderList } = await getBookmarks();
    const folderContextHash = md5(folderContext);

    const modifiedBookmarks = Object.entries(folders[folderContextHash]).map(
      (kvp) => bookmarksMapper(kvp, urlList, folderList)
    );

    set({
      contextBookmarks: modifiedBookmarks,
      urlList,
      folderList,
      folders,
      cutBookmarks: [],
      selectedBookmarks: [],
      isFetching: false,
    });
  },

  handleSelectedChange: (pos: number, isOnlySelection: boolean) => {
    const { selectedBookmarks } = get();
    const newData = [...selectedBookmarks];
    if (isOnlySelection) {
      newData.fill(false);
    }
    newData[pos] = !newData[pos];
    set({ selectedBookmarks: newData });
  },

  resetSelectedBookmarks: () => set({ selectedBookmarks: [] }),

  handleCutBookmarks: () => {
    const { selectedBookmarks } = get();
    set({ cutBookmarks: [...selectedBookmarks] });
  },

  resetCutBookmarks: () => set({ cutBookmarks: [] }),

  handleCreateNewFolder: (name: string, folderContext: string) => {
    const { contextBookmarks, folderList } = get();
    const isDir = true;
    const nameHash = md5(name);

    // Update current context folder
    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.unshift({
      id: nameHash,
      isDir,
      name,
      isDefault: false,
    });
    // Update data in all folders list
    const newFolderList = { ...folderList };
    newFolderList[nameHash] = getEncryptedFolder({
      id: nameHash,
      name,
      parentHash: md5(folderContext),
      isDefault: false,
    });

    set({
      contextBookmarks: newContextBookmarks,
      folderList: newFolderList,
      isSaveButtonActive: true,
    });
  },

  handleBookmarkSave: (
    updatedBookmark: ITransformedBookmark,
    oldFolder: string,
    newFolder: string,
    pos: number
  ) => {
    const { contextBookmarks, urlList, folders } = get();
    const oldBookmark = contextBookmarks.at(pos); // If undefined, it's a new bookmark
    if (oldBookmark?.isDir) {
      throw new Error(`Item at pos: ${pos} not a bookmark`);
    }
    const isFolderChange = oldFolder !== newFolder;
    const urlHash = md5(updatedBookmark.url);
    const newFolderHash = md5(newFolder);

    // Update urlList with new values
    const newUrlList = { ...urlList };
    newUrlList[urlHash] = getEncryptedBookmark({
      id: urlHash,
      url: updatedBookmark.url,
      title: updatedBookmark.title,
      taggedPersons: [...updatedBookmark.taggedPersons],
      parentHash: newFolderHash,
    });
    set({ urlList: newUrlList });

    // Update folders and current context folder content based on dir change
    if (isFolderChange) {
      const newFolders = { ...folders };
      newFolders[newFolderHash] ||= []; // To handle empty folders
      newFolders[newFolderHash].push({ isDir: false, hash: urlHash });

      const newContextBookmarks = [...contextBookmarks];
      newContextBookmarks.splice(pos, 1);

      set({ folders: newFolders, contextBookmarks: newContextBookmarks });
    } else {
      const newContextBookmarks = [...contextBookmarks];
      newContextBookmarks[pos] = { ...updatedBookmark };
      set({ contextBookmarks: newContextBookmarks });
    }

    // Add bookmark favicon in the cache
    addToCache(
      ECacheBucketKeys.favicon,
      getFaviconProxyUrl(updatedBookmark.url)
    );
    set({ isSaveButtonActive: true });
  },

  handleUrlRemove: (pos: number, url: string) => {
    const { contextBookmarks, urlList } = get();
    const urlHash = md5(url);
    const contextBookmark = contextBookmarks[pos];
    if (contextBookmark.isDir) {
      throw new Error(`Item at pos: ${pos} not a bookmark`);
    }

    // Remove from current context folder
    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.splice(pos, 1);

    // Remove from all urls list
    const newUrlList = { ...urlList };
    delete newUrlList[urlHash];

    set({
      contextBookmarks: newContextBookmarks,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  },

  handleBulkUrlRemove: () => {
    const { urlList, contextBookmarks, selectedBookmarks } = get();
    const newUrlList = { ...urlList };

    // Remove from current context folder
    const filteredBookmarks = contextBookmarks.filter((bookmark, index) => {
      if (selectedBookmarks[index] && !bookmark.isDir) {
        const urlHash = md5(bookmark.url);
        // Remove from all urls list
        delete newUrlList[urlHash];
        return false;
      }
      return true;
    });
    set({
      contextBookmarks: filteredBookmarks,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  },

  handleFolderRename: (oldName: string, newName: string, pos: number) => {
    const { folderList, urlList, folders, contextBookmarks } = get();
    const oldFolderHash = md5(oldName);
    const newFolderHash = md5(newName);

    // Update parentHash in urlList
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj['urlList']>(
      (obj, [hash, data]) => {
        if (data.parentHash === oldFolderHash) {
          obj[hash] = { ...data, parentHash: newFolderHash };
        } else {
          obj[hash] = data;
        }
        return obj;
      },
      {}
    );

    // Update name in folderList
    const newFolderList = { ...folderList };
    newFolderList[newFolderHash] = getEncryptedFolder({
      ...newFolderList[oldFolderHash],
      name: newName,
    });
    delete newFolderList[oldFolderHash];

    // Update in folders
    const newFolders = { ...folders };
    newFolders[newFolderHash] = newFolders[oldFolderHash];
    delete newFolders[oldFolderHash];

    // Update current folder
    const newContextBookmarks = [...contextBookmarks];
    const curFolder = newContextBookmarks[pos];
    if (!curFolder.isDir) {
      throw new Error(`Item at pos: ${pos} not a folder`);
    }
    newContextBookmarks[pos] = { ...curFolder, name: newName };
    set({
      urlList: newUrlList,
      folderList: newFolderList,
      folders: newFolders,
      contextBookmarks: newContextBookmarks,
      isSaveButtonActive: true,
    });
  },

  handleToggleDefaultFolder: (
    folderName: string,
    newIsDefault: boolean,
    pos: number
  ) => {
    const { folderList, contextBookmarks } = get();

    const folderHash = md5(folderName);
    const newFolderList = { ...folderList };
    // Remove existing default folder
    Object.values(newFolderList).forEach((v) => {
      v.isDefault = false;
    });
    // Make new folder as default
    if (newIsDefault) {
      newFolderList[folderHash] = {
        ...newFolderList[folderHash],
        isDefault: true,
      };
    }

    // Update current bookmark list
    const newContextBookmarks = [...contextBookmarks];
    const curFolder = newContextBookmarks[pos];
    if (!curFolder.isDir) {
      throw new Error(`Item at pos: ${pos} not a folder`);
    }
    newContextBookmarks[pos] = { ...curFolder, isDefault: newIsDefault };

    set({
      folderList: newFolderList,
      contextBookmarks: newContextBookmarks,
      isSaveButtonActive: true,
    });
  },

  handleFolderRemove: (pos: number, name: string) => {
    const { contextBookmarks, folderList, urlList, folders } = get();
    const folderHash = md5(name);
    if (isFolderContainsDir(folders, folderHash)) {
      notifications.show({
        message: 'Remove inner folders first',
        color: 'red',
      });
      return;
    }

    // Remove from current context folder
    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.splice(pos, 1);

    // Remove from all folders list
    const newFolderList = { ...folderList };
    delete newFolderList[folderHash];

    // Remove all urls inside the folder and update all urls in tagged persons
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj['urlList']>(
      (obj, [hash, data]) => {
        if (data.parentHash !== folderHash) {
          obj[hash] = data;
        }
        return obj;
      },
      {}
    );

    // Remove its data from folders
    const newFolders = { ...folders };
    delete newFolders[folderHash];

    set({
      contextBookmarks: newContextBookmarks,
      folderList: newFolderList,
      urlList: newUrlList,
      folders: newFolders,
      isSaveButtonActive: true,
    });
  },

  handleSave: async (folderContext: string) => {
    const { folders, urlList, folderList, contextBookmarks, loadData } = get();

    set({ isFetching: true });

    // Form folders obj for current context folder
    const newFolders = { ...folders };
    newFolders[md5(folderContext)] = contextBookmarks.map((x) => ({
      isDir: x.isDir,
      hash: md5(getBookmarkId(x)),
    }));
    const bookmarksObj: IBookmarksObj = {
      folderList,
      urlList,
      folders: newFolders,
    };
    await setBookmarksInStorage(bookmarksObj);
    await loadData(folderContext);

    set({ isFetching: false, isSaveButtonActive: false });
    notifications.show({ message: 'Saved temporarily' });
  },

  handlePasteSelectedBookmarks: () => {
    const { cutBookmarks, contextBookmarks, selectedBookmarks } = get();
    const selectedIdx = selectedBookmarks.findIndex(Boolean);
    if (selectedIdx === -1) {
      return;
    }
    const { newContextBookmarks, newSelectedBookmarks } = processBookmarksMove(
      selectedIdx,
      cutBookmarks,
      contextBookmarks
    );

    set({
      contextBookmarks: newContextBookmarks,
      selectedBookmarks: newSelectedBookmarks,
      cutBookmarks: [],
      isSaveButtonActive: true,
    });
  },
}));

export default useBookmarkStore;
