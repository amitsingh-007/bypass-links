import { openNewTab } from '@app/utils';
import {
  Bookmark,
  type ContextBookmarks,
  Folder,
  type IBookmarksObj,
  isFolderEmpty,
} from '@bypass/shared';
import clsx from 'clsx';
import { memo } from 'react';

export interface Props {
  index: number;
  folders: IBookmarksObj['folders'];
  contextBookmarks: ContextBookmarks;
}

const onOpenLink = (_url: string) => {
  openNewTab(_url);
};

const VirtualRow = memo<Props>(({ index, folders, contextBookmarks }) => {
  const ctx = contextBookmarks[index];

  return (
    <div
      className={clsx(
        `
          box-border h-full cursor-pointer rounded-md select-none
          hover:bg-muted
        `
      )}
    >
      {ctx.isDir ? (
        <Folder
          id={ctx.id}
          name={ctx.name}
          isEmpty={isFolderEmpty(folders, ctx.id)}
        />
      ) : (
        <Bookmark
          id={ctx.id}
          url={ctx.url}
          title={ctx.title}
          taggedPersons={ctx.taggedPersons}
          onOpenLink={onOpenLink}
        />
      )}
    </div>
  );
});

export default VirtualRow;
