import { z } from 'zod';
import {
  EncodedBookmarkSchema,
  EncodedFolderSchema,
  FolderMetaDataSchema,
  BookmarksObjSchema,
} from '../schema';

export type IEncodedBookmark = z.infer<typeof EncodedBookmarkSchema>;

export type IEncodedFolder = z.infer<typeof EncodedFolderSchema>;

export type IFolderMetaData = z.infer<typeof FolderMetaDataSchema>;

export type IBookmarksObj = z.infer<typeof BookmarksObjSchema>;

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

export type ISelectedBookmarks = boolean[];
