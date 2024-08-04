import { z } from 'zod';
import { PersonsSchema } from '../../Persons/schema';

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

export const BookmarksAndPersonsValidationSchema = z
  .object({
    bookmarks: BookmarksObjSchema,
    persons: PersonsSchema,
  })
  .refine(
    ({ bookmarks, persons }) => {
      for (const [bmId, bmData] of Object.entries(bookmarks.urlList)) {
        const isMismatch = bmData.taggedPersons.some(
          (personId) => !persons[personId]
        );
        // Check if the bookmark is tagged to a missing person
        if (isMismatch) {
          console.error(`Bookmark ${bmId} is mismatch`, bmData);
          return false;
        }
      }
      return true;
    },
    { message: 'Bookmarks and persons data mismatch' }
  )
  .refine(
    ({ bookmarks }) => {
      const allData = { ...bookmarks.urlList, ...bookmarks.folderList };
      for (const [bmId, bmData] of Object.entries(allData)) {
        // Ignore root folder
        if (!bmData.parentHash) {
          return true;
        }
        const parentFolder = bookmarks.folders[bmData.parentHash];
        // Check if the parent folder exists
        if (!parentFolder) {
          console.error(`Bookmark ${bmId} parent data not found`, bmData);
          return false;
        }
        const isMissing = !parentFolder.some((item) => item.hash === bmId);
        // Check if bookmark is referenced in some folder
        if (isMissing) {
          console.error(`Bookmark ${bmId} is missing`, bmData);
          return false;
        }
      }
      return true;
    },
    { message: 'Incorrect bookmarks data' }
  );
