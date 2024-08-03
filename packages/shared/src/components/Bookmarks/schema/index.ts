import { z } from 'zod';

export const EncodedBookmarkSchema = z.object({
  url: z.string(),
  title: z.string(),
  parentHash: z.string(),
  taggedPersons: z.array(z.string()).default([]),
});

export const EncodedFolderSchema = z.object({
  name: z.string(),
  parentHash: z.string(),
  isDefault: z.boolean().optional(),
});

export const FolderMetaDataSchema = z.object({
  isDir: z.boolean(),
  hash: z.string(),
});

export const BookmarksObjSchema = z.object({
  folderList: z.record(EncodedFolderSchema),
  urlList: z.record(EncodedBookmarkSchema),
  folders: z.record(z.array(FolderMetaDataSchema)),
});
