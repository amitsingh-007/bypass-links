import {
  type ContextBookmarks,
  ECacheBucketKeys,
  type IBookmarksObj,
  type ITransformedBookmark,
  addToCache,
  bookmarksMapper,
  filterRecord,
  getEncryptedBookmark,
  getEncryptedFolder,
} from '@bypass/shared';
import { toast } from 'sonner';
import { create } from 'zustand';

import { getFaviconUrl } from '@/constants/favicon';
import { bookmarksItem } from '@/storage/items';

import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import { findBookmarkById, findBookmarkByUrl } from '../utils/bookmark';
import { processBookmarksMove } from '../utils/manipulate';

interface State {
  contextBookmarks: ContextBookmarks;
  urlList: IBookmarksObj['urlList'];
  folderList: IBookmarksObj['folderList'];
  folders: IBookmarksObj['folders'];
  /** Bookmark ids, so a search filter cannot shift what a bulk action hits. */
  selectedBookmarks: Set<string>;
  cutBookmarks: Set<string>;
  isFetching: boolean;
  isSaveButtonActive: boolean;

  loadData: (folderId: string) => Promise<void>;
  handleSelectedChange: (id: string, isOnlySelection: boolean) => void;
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

const useBookmarkStore = create<State>()((set, get) => ({
  contextBookmarks: [],
  urlList: {},
  folderList: {},
  folders: {},
  selectedBookmarks: new Set(),
  cutBookmarks: new Set(),
  isFetching: true,
  isSaveButtonActive: false,

  async loadData(folderId: string) {
    set({ isSaveButtonActive: false, isFetching: true });
    const { folders, urlList, folderList } = await bookmarksItem.getValue();

    const modifiedBookmarks = (folders[folderId] ?? []).map((meta) =>
      bookmarksMapper(meta, urlList, folderList)
    );

    set({
      contextBookmarks: modifiedBookmarks,
      urlList,
      folderList,
      folders,
      cutBookmarks: new Set(),
      selectedBookmarks: new Set(),
      isFetching: false,
    });
  },

  handleSelectedChange(id: string, isOnlySelection: boolean) {
    const { selectedBookmarks } = get();
    if (isOnlySelection) {
      set({ selectedBookmarks: new Set([id]) });
      return;
    }
    const newSelection = new Set(selectedBookmarks);
    if (!newSelection.delete(id)) {
      newSelection.add(id);
    }
    set({ selectedBookmarks: newSelection });
  },

  resetSelectedBookmarks: () => set({ selectedBookmarks: new Set() }),

  handleCutBookmarks() {
    const { selectedBookmarks } = get();
    set({ cutBookmarks: new Set(selectedBookmarks) });
  },

  handleCreateNewFolder(name: string, parentFolderId: string) {
    const { contextBookmarks, folderList } = get();
    const isDir = true;
    const newFolderId = crypto.randomUUID();

    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.unshift({
      id: newFolderId,
      isDir,
      name,
      isDefault: false,
    });
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

    const oldBookmarkData = findBookmarkById(
      contextBookmarks,
      updatedBookmark.id
    );
    const isNewBookmark = !oldBookmarkData;

    const existingBookmarkWithUrl = findBookmarkByUrl(
      urlList,
      updatedBookmark.url
    );
    if (existingBookmarkWithUrl) {
      const isDupe =
        isNewBookmark || existingBookmarkWithUrl.id !== updatedBookmark.id;
      if (isDupe) {
        toast.error('A bookmark with this URL already exists');
        return false;
      }
    }

    const isFolderChange = oldFolderId !== newFolderId;

    const newUrlList = { ...urlList };
    newUrlList[updatedBookmark.id] = getEncryptedBookmark({
      id: updatedBookmark.id,
      url: updatedBookmark.url,
      title: updatedBookmark.title,
      taggedPersons: [...updatedBookmark.taggedPersons],
      parentHash: newFolderId,
    });
    set({ urlList: newUrlList });

    if (isFolderChange) {
      const newFolders = { ...folders };
      newFolders[newFolderId] ||= [];
      newFolders[newFolderId].push({
        isDir: false,
        hash: updatedBookmark.id,
      });

      const newContextBookmarks = contextBookmarks.filter(
        (bm) => bm.isDir || bm.id !== updatedBookmark.id
      );

      set({ folders: newFolders, contextBookmarks: newContextBookmarks });
    } else if (isNewBookmark) {
      const newContextBookmarks = [...contextBookmarks, updatedBookmark];
      set({ contextBookmarks: newContextBookmarks });
    } else {
      const newContextBookmarks = contextBookmarks.map((bm) =>
        !bm.isDir && bm.id === updatedBookmark.id ? updatedBookmark : bm
      );
      set({ contextBookmarks: newContextBookmarks });
    }

    addToCache(ECacheBucketKeys.favicon, getFaviconUrl(updatedBookmark.url));
    set({ isSaveButtonActive: true });
    return true;
  },

  handleUrlRemove(bookmarkId: string) {
    const { contextBookmarks, urlList } = get();

    const bookmark = findBookmarkById(contextBookmarks, bookmarkId);

    if (!bookmark) {
      throw new Error(`Bookmark with id: ${bookmarkId} not found`);
    }

    const newContextBookmarks = contextBookmarks.filter(
      (bm) => bm.isDir || bm.id !== bookmarkId
    );

    const newUrlList = filterRecord(urlList, (id) => id !== bookmarkId);

    set({
      contextBookmarks: newContextBookmarks,
      urlList: newUrlList,
      isSaveButtonActive: true,
      selectedBookmarks: new Set(),
    });
  },

  handleBulkUrlRemove() {
    const { urlList, contextBookmarks, selectedBookmarks } = get();

    set({
      contextBookmarks: contextBookmarks.filter(
        (bm) => bm.isDir || !selectedBookmarks.has(bm.id)
      ),
      urlList: filterRecord(urlList, (id) => !selectedBookmarks.has(id)),
      isSaveButtonActive: true,
      selectedBookmarks: new Set(),
    });
  },

  handleFolderRename(folderId: string, newName: string) {
    const { folderList, contextBookmarks } = get();
    const newFolderList = { ...folderList };
    newFolderList[folderId] = getEncryptedFolder({
      ...newFolderList[folderId],
      name: newName,
    });

    const newContextBookmarks = contextBookmarks.map((folder) =>
      folder.isDir && folder.id === folderId
        ? Object.assign({}, folder, { name: newName })
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

    const newContextBookmarks = contextBookmarks.map((folder) =>
      folder.isDir
        ? Object.assign({}, folder, {
            isDefault: newIsDefault && folder.id === folderId,
          })
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
      toast.error('Remove inner folders first');
      return;
    }

    const newContextBookmarks = contextBookmarks.filter(
      (bookmark) => bookmark.id !== folderId
    );

    const newFolderList = filterRecord(folderList, (id) => id !== folderId);

    const newUrlList = filterRecord(
      urlList,
      (_id, data) => data.parentHash !== folderId
    );

    const newFolders = filterRecord(folders, (id) => id !== folderId);

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
    toast.success('Saved temporarily');
  },

  handlePasteSelectedBookmarks() {
    const { cutBookmarks, contextBookmarks, selectedBookmarks } = get();
    const destinationIndex = contextBookmarks.findIndex(({ id }) =>
      selectedBookmarks.has(id)
    );
    if (destinationIndex === -1) {
      return;
    }
    const { newContextBookmarks, newSelectedBookmarks } = processBookmarksMove(
      destinationIndex,
      cutBookmarks,
      contextBookmarks
    );

    set({
      contextBookmarks: newContextBookmarks,
      selectedBookmarks: newSelectedBookmarks,
      cutBookmarks: new Set(),
      isSaveButtonActive: true,
    });
  },
}));

export default useBookmarkStore;
