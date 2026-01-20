import { getBookmarks } from '@helpers/fetchFromStorage';
import {
  type ContextBookmarks,
  ECacheBucketKeys,
  type IBookmarksObj,
  type ITransformedBookmark,
  type ISelectedBookmarks,
  addToCache,
  bookmarksMapper,
  getEncryptedBookmark,
  getFaviconProxyUrl,
  getEncryptedFolder,
} from '@bypass/shared';
import md5 from 'md5';
import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import { findBookmarkById, isDuplicateUrl } from '../utils/bookmark';
import { processBookmarksMove } from '../utils/manipulate';

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
    newFolder: string
  ) => boolean;
  handleUrlRemove: (bookmarkId: string) => void;
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

// Helper to check if URL already exists for a different bookmark

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

  async loadData(folderContext: string) {
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

  handleSelectedChange(pos: number, isOnlySelection: boolean) {
    const { selectedBookmarks } = get();
    const newData = [...selectedBookmarks];
    if (isOnlySelection) {
      newData.fill(false);
    }
    newData[pos] = !newData[pos];
    set({ selectedBookmarks: newData });
  },

  resetSelectedBookmarks: () => set({ selectedBookmarks: [] }),

  handleCutBookmarks() {
    const { selectedBookmarks } = get();
    set({ cutBookmarks: [...selectedBookmarks] });
  },

  resetCutBookmarks: () => set({ cutBookmarks: [] }),

  handleCreateNewFolder(name: string, folderContext: string) {
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

  handleBookmarkSave(
    updatedBookmark: ITransformedBookmark,
    oldFolder: string,
    newFolder: string
  ) {
    const { contextBookmarks, urlList, folders } = get();

    // Find old bookmark by ID
    const oldBookmarkData = findBookmarkById(
      contextBookmarks,
      updatedBookmark.id
    );
    const isNewBookmark = !oldBookmarkData;

    // Check for duplicate URL
    if (isDuplicateUrl(urlList, updatedBookmark.url, updatedBookmark.id)) {
      notifications.show({
        message: 'A bookmark with this URL already exists',
        color: 'red',
      });
      return false;
    }

    const isFolderChange = oldFolder !== newFolder;
    const newFolderHash = md5(newFolder);

    // Update urlList - key is always bookmark.id
    const newUrlList = { ...urlList };
    newUrlList[updatedBookmark.id] = getEncryptedBookmark({
      id: updatedBookmark.id,
      url: updatedBookmark.url,
      title: updatedBookmark.title,
      taggedPersons: [...updatedBookmark.taggedPersons],
      parentHash: newFolderHash,
    });
    set({ urlList: newUrlList });

    // Update folders and current context folder content based on folder change
    if (isFolderChange) {
      const newFolders = { ...folders };
      newFolders[newFolderHash] ||= []; // To handle empty folders
      newFolders[newFolderHash].push({
        isDir: false,
        hash: updatedBookmark.id,
      });

      // Remove from current context (filter by ID)
      const newContextBookmarks = contextBookmarks.filter(
        (bm) => bm.isDir || bm.id !== updatedBookmark.id
      );

      set({ folders: newFolders, contextBookmarks: newContextBookmarks });
    } else if (isNewBookmark) {
      // New bookmark - append to current context
      const newContextBookmarks = [...contextBookmarks, updatedBookmark];
      set({ contextBookmarks: newContextBookmarks });
    } else {
      // Update existing bookmark in place (find by ID)
      const newContextBookmarks = contextBookmarks.map((bm) =>
        !bm.isDir && bm.id === updatedBookmark.id ? { ...updatedBookmark } : bm
      );
      set({ contextBookmarks: newContextBookmarks });
    }

    // Cache favicon for new URL
    addToCache(
      ECacheBucketKeys.favicon,
      getFaviconProxyUrl(updatedBookmark.url)
    );
    set({ isSaveButtonActive: true });
    return true;
  },

  handleUrlRemove(bookmarkId: string) {
    const { contextBookmarks, urlList } = get();

    // Find bookmark by ID
    const bookmark = findBookmarkById(contextBookmarks, bookmarkId);

    if (!bookmark) {
      throw new Error(`Bookmark with id: ${bookmarkId} not found`);
    }

    // Remove from current context folder (filter by ID)
    const newContextBookmarks = contextBookmarks.filter(
      (bm) => bm.isDir || bm.id !== bookmarkId
    );

    // Remove from urlList using bookmark ID directly as key
    const newUrlList = { ...urlList };
    delete newUrlList[bookmarkId];

    set({
      contextBookmarks: newContextBookmarks,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  },

  handleBulkUrlRemove() {
    const { urlList, contextBookmarks, selectedBookmarks } = get();
    const newUrlList = { ...urlList };

    // Get IDs of selected bookmarks to remove
    const idsToRemove = new Set(
      contextBookmarks
        .filter(
          (bm, index): bm is ITransformedBookmark =>
            selectedBookmarks[index] && !bm.isDir
        )
        .map((bm) => bm.id)
    );

    // Remove from urlList using bookmark IDs directly as keys
    idsToRemove.forEach((id) => {
      delete newUrlList[id];
    });

    // Filter contextBookmarks by ID
    const filteredBookmarks = contextBookmarks.filter(
      (bm) => bm.isDir || !idsToRemove.has(bm.id)
    );

    set({
      contextBookmarks: filteredBookmarks,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: [],
    });
  },

  handleFolderRename(oldName: string, newName: string, pos: number) {
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

  handleToggleDefaultFolder(
    folderName: string,
    newIsDefault: boolean,
    pos: number
  ) {
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

  handleFolderRemove(pos: number, name: string) {
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

  async handleSave(folderContext: string) {
    const { folders, urlList, folderList, contextBookmarks, loadData } = get();

    set({ isFetching: true });

    // Form folders obj for current context folder
    const newFolders = { ...folders };
    newFolders[md5(folderContext)] = contextBookmarks.map((x) => ({
      isDir: x.isDir,
      // For folders: use md5(name) as hash (to match folderList keys)
      // For bookmarks: use x.id (which is the urlList key)
      hash: x.isDir ? md5(x.name) : x.id,
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

  handlePasteSelectedBookmarks() {
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
