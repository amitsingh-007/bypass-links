import { z } from 'zod/mini';

import { PersonsSchema } from '../../Persons/schema';

export const EncodedBookmarkSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  parentHash: z.string(),
  taggedPersons: z._default(z.array(z.string()), []),
});

export const EncodedFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentHash: z.string(),
  isDefault: z.optional(z.boolean()),
});

export const FolderMetaDataSchema = z.object({
  isDir: z.boolean(),
  hash: z.string(),
});

export const BookmarksObjSchema = z.object({
  folderList: z.record(z.string(), EncodedFolderSchema),
  urlList: z.record(z.string(), EncodedBookmarkSchema),
  folders: z.record(z.string(), z.array(FolderMetaDataSchema)),
});

export const BookmarksAndPersonsValidationSchema = z
  .object({
    bookmarks: BookmarksObjSchema,
    persons: PersonsSchema,
  })
  .check(
    z.refine(
      ({ bookmarks, persons }) => {
        for (const [bmId, bmData] of Object.entries(bookmarks.urlList)) {
          const isMismatch = bmData.taggedPersons.some(
            (personId) => !persons[personId]
          );
          if (isMismatch) {
            console.error(`Bookmark ${bmId} is mismatch`, bmData);
            return false;
          }
        }
        return true;
      },
      { message: 'Bookmarks and persons data mismatch' }
    )
  )
  .check(
    z.refine(
      ({ bookmarks }) => {
        const allData = { ...bookmarks.urlList, ...bookmarks.folderList };
        for (const [bmId, bmData] of Object.entries(allData)) {
          // Ignore root folder
          if (!bmData.parentHash) {
            continue;
          }
          const parentFolder = bookmarks.folders[bmData.parentHash];
          if (!parentFolder) {
            console.error(`Bookmark ${bmId} parent data not found`, bmData);
            return false;
          }
          const isMissing = !parentFolder.some((item) => item.hash === bmId);
          if (isMissing) {
            console.error(`Bookmark ${bmId} is missing`, bmData);
            return false;
          }
        }
        return true;
      },
      { message: 'Incorrect bookmarks data' }
    )
  );
