import { getBookmarks } from '@helpers/fetchFromStorage';
import usePersonStore from '@/store/person';
import useToastStore from '@/store/toast';
import {
  ContextBookmarks,
  ECacheBucketKeys,
  IBookmarksObj,
  IDecodedBookmark,
  ISelectedBookmarks,
  IUpdateTaggedPerson,
  addToCache,
  bookmarksMapper,
  getBookmarkId,
  getDecryptedBookmark,
  getEncryptedBookmark,
  getFaviconProxyUrl,
} from '@bypass/shared';
import md5 from 'md5';
import { create } from 'zustand';
import { isFolderContainsDir, setBookmarksInStorage } from '../utils';
import {
  getBookmarksAfterDrag,
  getDestinationIndex,
  getSelectedBookmarksAfterDrag,
} from '../utils/manipulate';

interface State {
  // State
  contextBookmarks: ContextBookmarks;
  urlList: IBookmarksObj['urlList'];
  folderList: IBookmarksObj['folderList'];
  folders: IBookmarksObj['folders'];
  selectedBookmarks: ISelectedBookmarks;
  isFetching: boolean;
  isSaveButtonActive: boolean;
  updateTaggedPersons: IUpdateTaggedPerson[];

  // Actions
  loadData: (folderContext: string) => Promise<void>;
  addToUpdateTaggedPersons: (
    urlHash: string,
    prevTaggedPersons: string[],
    newTaggedPersons: string[]
  ) => void;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  resetSelectedBookmarks: () => void;
  handleCreateNewFolder: (name: string, folderContext: string) => void;
  handleBookmarkSave: (
    updatedBookmark: IDecodedBookmark,
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
  handleMoveBookmarks: (destinationIndex: number) => void;
}

const useBookmarkStore = create<State>()((set, get) => ({
  contextBookmarks: [],
  urlList: {},
  folderList: {},
  folders: {},
  selectedBookmarks: [],
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
      selectedBookmarks: [],
      isFetching: false,
    });
  },

  addToUpdateTaggedPersons: (
    urlHash: string,
    prevTaggedPersons: string[] = [],
    newTaggedPersons: string[] = []
  ) => {
    const { updateTaggedPersons } = get();
    const newData = [
      ...updateTaggedPersons,
      {
        prevTaggedPersons,
        newTaggedPersons,
        urlHash,
      },
    ];
    set({ updateTaggedPersons: newData });
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

  handleCreateNewFolder: (name: string, folderContext: string) => {
    const { contextBookmarks, folderList } = get();
    const isDir = true;
    const nameHash = md5(name);

    // Update current context folder
    const newContextBookmarks = [...contextBookmarks];
    newContextBookmarks.unshift({ isDir, name, isDefault: false });
    // Update data in all folders list
    const newFolderList = { ...folderList };
    newFolderList[nameHash] = {
      name: btoa(name),
      parentHash: md5(folderContext),
      isDefault: false,
    };

    set({
      contextBookmarks: newContextBookmarks,
      folderList: newFolderList,
      isSaveButtonActive: true,
    });
  },

  handleBookmarkSave: (
    updatedBookmark: IDecodedBookmark,
    oldFolder: string,
    newFolder: string,
    pos: number
  ) => {
    const { contextBookmarks, urlList, folders, addToUpdateTaggedPersons } =
      get();
    const oldBookmark = contextBookmarks.at(pos); // If undefined, it's a new bookmark
    if (oldBookmark?.isDir) {
      throw new Error(`Item at pos: ${pos} not a bookmark`);
    }
    const isFolderChange = oldFolder !== newFolder;
    const urlHash = md5(updatedBookmark.url);
    const newFolderHash = md5(newFolder);

    // Update url in tagged persons
    addToUpdateTaggedPersons(
      urlHash,
      oldBookmark?.taggedPersons ?? [],
      updatedBookmark.taggedPersons
    );

    // Update urlList with new values
    const newUrlList = { ...urlList };
    newUrlList[urlHash] = getEncryptedBookmark({
      url: updatedBookmark.url,
      title: updatedBookmark.title,
      taggedPersons: [...updatedBookmark.taggedPersons],
      parentHash: newFolderHash,
    });
    set({ urlList: newUrlList });

    // Update folders and current context folder content based on dir change
    if (isFolderChange) {
      const newFolders = { ...folders };
      newFolders[newFolderHash] = newFolders[newFolderHash] || []; // to handle empty folders
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
    const { contextBookmarks, urlList, addToUpdateTaggedPersons } = get();
    const urlHash = md5(url);
    const contextBookmark = contextBookmarks[pos];
    if (contextBookmark.isDir) {
      throw new Error(`Item at pos: ${pos} not a bookmark`);
    }

    // Update url in tagged persons
    addToUpdateTaggedPersons(urlHash, contextBookmark.taggedPersons, []);

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
    const taggedPersonData: IUpdateTaggedPerson[] = [];

    // Remove from current context folder
    const filteredBookmarks = contextBookmarks.filter((bookmark, index) => {
      if (selectedBookmarks[index] && !bookmark.isDir) {
        const urlHash = md5(bookmark.url);
        // Update url in tagged persons
        taggedPersonData.push({
          prevTaggedPersons: bookmark.taggedPersons || [],
          newTaggedPersons: [],
          urlHash,
        });
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
      updateTaggedPersons: taggedPersonData,
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
    newFolderList[newFolderHash] = {
      ...newFolderList[oldFolderHash],
      name: btoa(newName),
    };
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
    const {
      contextBookmarks,
      folderList,
      urlList,
      folders,
      updateTaggedPersons,
    } = get();
    const { displayToast } = useToastStore.getState();
    const folderHash = md5(name);
    if (isFolderContainsDir(folders, folderHash)) {
      displayToast({
        message: 'Remove inner folders first.',
        severity: 'error',
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
    const taggedPersonData: IUpdateTaggedPerson[] = [];
    const newUrlList = Object.entries(urlList).reduce<IBookmarksObj['urlList']>(
      (obj, [hash, data]) => {
        const decodedBookmark = getDecryptedBookmark(data);
        if (data.parentHash === folderHash) {
          taggedPersonData.push({
            prevTaggedPersons: decodedBookmark.taggedPersons,
            newTaggedPersons: [],
            urlHash: hash,
          });
        } else {
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
      updateTaggedPersons: [...updateTaggedPersons, ...taggedPersonData],
      isSaveButtonActive: true,
    });
  },

  handleSave: async (folderContext: string) => {
    const {
      folders,
      urlList,
      folderList,
      contextBookmarks,
      updateTaggedPersons,
      loadData,
    } = get();
    const { updateTaggedPersonUrls } = usePersonStore.getState();
    const { displayToast } = useToastStore.getState();

    set({ isFetching: true });
    // Update url in tagged persons
    updateTaggedPersonUrls(updateTaggedPersons);

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
    displayToast({
      message: 'Saved temporarily',
      duration: 1500,
    });
  },

  handleMoveBookmarks: (destinationIndex: number) => {
    const { selectedBookmarks, contextBookmarks } = get();

    const destIndex = getDestinationIndex(destinationIndex, selectedBookmarks);
    const newContextBookmarks = getBookmarksAfterDrag(
      contextBookmarks,
      selectedBookmarks,
      destIndex
    );
    const newSelectedBookmarks = getSelectedBookmarksAfterDrag(
      [...selectedBookmarks],
      destIndex
    );

    set({
      contextBookmarks: newContextBookmarks,
      selectedBookmarks: newSelectedBookmarks,
      isSaveButtonActive: true,
    });
  },
}));

export default useBookmarkStore;
