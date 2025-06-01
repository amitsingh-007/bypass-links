import { type z } from 'zod';
import {
  type EncodedBookmarkSchema,
  type EncodedFolderSchema,
  type FolderMetaDataSchema,
  type BookmarksObjSchema,
} from '../schema';

export type IEncodedBookmark = z.infer<typeof EncodedBookmarkSchema>;

export type IEncodedFolder = z.infer<typeof EncodedFolderSchema>;

export type IFolderMetaData = z.infer<typeof FolderMetaDataSchema>;

export type IBookmarksObj = z.infer<typeof BookmarksObjSchema>;

export interface ITransformedBookmark {
  id: string;
  isDir: false;
  url: string;
  title: string;
  taggedPersons: string[];
}

export interface ITransformedFolder {
  id: string;
  isDir: true;
  name: string;
  isDefault: boolean;
}

export type ContextBookmark = ITransformedBookmark | ITransformedFolder;

export type ContextBookmarks = ContextBookmark[];

export type ISelectedBookmarks = boolean[];
