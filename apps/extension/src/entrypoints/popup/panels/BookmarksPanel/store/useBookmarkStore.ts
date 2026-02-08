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
import { create } from 'zustand';
import { notifications } from '@mantine/notifications';
import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import { findBookmarkById, findBookmarkByUrl } from '../utils/bookmark';
import { processBookmarksMove } from '../utils/manipulate';
import { getBookmarks } from '@/storage';

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
  loadData: (folderId: string) => Promise<void>;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  resetSelectedBookmarks: () => void;
  handleCutBookmarks: () => void;
  handleCreateNewFolder: (name: string, parentFolderId: string) => void;
  handleBookmarkSave: (
    updatedBookmark: ITransformedBookmark,
    oldFolderId: string,
    newFolderId: string
  ) => boolean;
  handleUrlRemove: (bookmarkId: string) => void;
  handleBulkUrlRemove: () => void;
  handleFolderRename: (folderId: string, newName: string) => void;
  handleToggleDefaultFolder: (folderId: string, newIsDefault: boolean) => void;
  handleFolderRemove: (folderId: string) => void;
  handleSave: (currentFolderId: string) => Promise<void>;
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

  async loadData(folderId: string) {
    set({ isSaveButtonActive: false, isFetching: true });
    const { folders, urlList, folderList } = await getBookmarks();

    const modifiedBookmarks = Object.entries(folders[folderId]).map((kvp) =>
      bookmarksMapper(kvp, urlList, folderList)
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

  handleCreateNewFolder(name: string, parentFolderId: string) {
    const { contextBookmarks, folderList } = get();
    const isDir = true;
    const newFolderId = crypto.randomUUID();

    // Update current context folder
    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.unshift({
      id: newFolderId,
      isDir,
      name,
      isDefault: false,
    });
    // Update data in all folders list
    const newFolderList = { ...folderList };
    newFolderList[newFolderId] = getEncryptedFolder({
      id: newFolderId,
      name,
      parentHash: parentFolderId,
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
    oldFolderId: string,
    newFolderId: string
  ) {
    const { contextBookmarks, urlList, folders } = get();

    // Find old bookmark by ID
    const oldBookmarkData = findBookmarkById(
      contextBookmarks,
      updatedBookmark.id
    );
    const isNewBookmark = !oldBookmarkData;

    // Check for duplicate URL
    const existingBookmarkWithUrl = findBookmarkByUrl(
      urlList,
      updatedBookmark.url
    );
    if (existingBookmarkWithUrl) {
      // It's a duplicate if it's a new bookmark, OR if it's an existing bookmark with a different ID.
      const isDupe =
        isNewBookmark || existingBookmarkWithUrl.id !== updatedBookmark.id;
      if (isDupe) {
        notifications.show({
          message: 'A bookmark with this URL already exists',
          color: 'red',
        });
        return false;
      }
    }

    const isFolderChange = oldFolderId !== newFolderId;

    // Update urlList - key is always bookmark.id
    const newUrlList = { ...urlList };
    newUrlList[updatedBookmark.id] = getEncryptedBookmark({
      id: updatedBookmark.id,
      url: updatedBookmark.url,
      title: updatedBookmark.title,
      taggedPersons: [...updatedBookmark.taggedPersons],
      parentHash: newFolderId,
    });
    set({ urlList: newUrlList });

    // Update folders and current context folder content based on folder change
    if (isFolderChange) {
      const newFolders = { ...folders };
      newFolders[newFolderId] ||= []; // To handle empty folders
      newFolders[newFolderId].push({
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

  handleFolderRename(folderId: string, newName: string) {
    const { folderList, contextBookmarks } = get();
    // Update name in folderList
    const newFolderList = { ...folderList };
    newFolderList[folderId] = getEncryptedFolder({
      ...newFolderList[folderId],
      name: newName,
    });

    // Update current folder context if needed
    const newContextBookmarks = contextBookmarks.map((folder) =>
      folder.isDir && folder.id === folderId
        ? { ...folder, name: newName }
        : folder
    );

    set({
      folderList: newFolderList,
      contextBookmarks: newContextBookmarks,
      isSaveButtonActive: true,
    });
  },

  handleToggleDefaultFolder(folderId: string, newIsDefault: boolean) {
    const { folderList, contextBookmarks } = get();

    const newFolderList = Object.fromEntries(
      Object.entries(folderList).map(([id, folder]) => [
        id,
        { ...folder, isDefault: newIsDefault && id === folderId },
      ])
    );

    // Update current bookmark list - remove default from all folders, then set new default
    const newContextBookmarks = contextBookmarks.map((folder) =>
      folder.isDir
        ? { ...folder, isDefault: newIsDefault && folder.id === folderId }
        : folder
    );

    set({
      folderList: newFolderList,
      contextBookmarks: newContextBookmarks,
      isSaveButtonActive: true,
    });
  },

  handleFolderRemove(folderId: string) {
    const { contextBookmarks, folderList, urlList, folders } = get();
    if (isFolderContainsDir(folders, folderId)) {
      notifications.show({
        message: 'Remove inner folders first',
        color: 'red',
      });
      return;
    }

    // Remove from current context folder
    const newContextBookmarks = contextBookmarks.filter(
      (bookmark) => bookmark.id !== folderId
    );

    // Remove from all folders list
    const newFolderList = { ...folderList };
    delete newFolderList[folderId];

    // Remove all urls inside the folder and update all urls in tagged persons
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj['urlList']>(
      (obj, [hash, data]) => {
        if (data.parentHash !== folderId) {
          obj[hash] = data;
        }
        return obj;
      },
      {}
    );

    // Remove its data from folders
    const newFolders = { ...folders };
    delete newFolders[folderId];

    set({
      contextBookmarks: newContextBookmarks,
      folderList: newFolderList,
      urlList: newUrlList,
      folders: newFolders,
      isSaveButtonActive: true,
    });
  },

  async handleSave(currentFolderId: string) {
    const { folders, urlList, folderList, contextBookmarks, loadData } = get();

    set({ isFetching: true });

    // Form folders obj for current context folder
    const newFolders = { ...folders };
    newFolders[currentFolderId] = contextBookmarks.map((x) => ({
      isDir: x.isDir,
      hash: x.id,
    }));
    const bookmarksObj: IBookmarksObj = {
      folderList,
      urlList,
      folders: newFolders,
    };
    await setBookmarksInStorage(bookmarksObj);
    await loadData(currentFolderId);

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
