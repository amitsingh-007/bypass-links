import useBookmarkStore from '@/store/bookmark';
import { getCurrentTab } from '@/utils/tabs';
import {
  BOOKMARK_OPERATION,
  ContextBookmarks,
  DEFAULT_BOOKMARK_FOLDER,
  getBookmarksPanelUrl,
  getDecodedFolderList,
  IBookmarkOperation,
  IBookmarksObj,
  IDecodedBookmark,
} from '@bypass/shared';
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonSelect from './PersonSelect';

const HEADING = {
  [BOOKMARK_OPERATION.NONE]: '',
  [BOOKMARK_OPERATION.ADD]: 'Add bookmark',
  [BOOKMARK_OPERATION.EDIT]: 'Edit bookmark',
};

interface Props {
  folderList: IBookmarksObj['folderList'];
  curFolder: string;
  contextBookmarks: ContextBookmarks;
  handleScroll: (pos: number) => void;
  handleSelectedChange: (pos: number, isOnlySelection: boolean) => void;
  onSave: (
    url: string,
    newTitle: string,
    folder: string,
    newFolder: string,
    pos: number,
    taggedPersons: string[],
    newTaggedPersons: string[]
  ) => void;
  onDelete: (pos: number, url: string) => void;
}

interface IForm {
  pos: number;
  url: string;
  title: string;
  folder: string;
  taggedPersons: string[];
}

const validateHandler = (value: string) => (!value?.trim() ? 'Required' : null);

const BookmarkAddEditDialog = memo<Props>(function BookmarkAddEditDialog({
  folderList,
  curFolder,
  contextBookmarks,
  handleScroll,
  handleSelectedChange,
  onSave,
  onDelete,
}) {
  const navigate = useNavigate();
  const resetBookmarkOperation = useBookmarkStore(
    (state) => state.resetBookmarkOperation
  );
  const { operation, url: bmUrl } = useBookmarkStore(
    (state) => state.bookmarkOperation
  );
  const [origTaggedPersons, setOrigTaggedPersons] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const { folderNamesList, defaultFolderName } = useMemo(() => {
    const decodedFolderList = getDecodedFolderList(folderList);
    const folderNames = decodedFolderList.map((x) => x.name);
    const defaultFolder = decodedFolderList.find((x) => x.isDefault);
    return {
      folderNamesList: folderNames,
      defaultFolderName: defaultFolder?.name,
    };
  }, [folderList]);

  const form = useForm<IForm>({
    initialValues: {
      pos: -1,
      url: '',
      title: '',
      folder: DEFAULT_BOOKMARK_FOLDER,
      taggedPersons: [],
    },
    validate: {
      url: validateHandler,
      title: validateHandler,
      folder: validateHandler,
    },
  });

  const resolveBookmark = useCallback(
    async (_operation: IBookmarkOperation, _bmUrl: string) => {
      if (_operation === BOOKMARK_OPERATION.ADD) {
        const { title = '' } = await getCurrentTab();
        form.setValues({
          pos: contextBookmarks.length,
          url: _bmUrl,
          title,
          folder: defaultFolderName || DEFAULT_BOOKMARK_FOLDER,
          taggedPersons: [],
        });
        setOrigTaggedPersons([]);
        setOpenDialog(true);
        return;
      }

      let bookmark: Required<IDecodedBookmark> | undefined;
      let pos = -1;
      contextBookmarks.forEach((x, index) => {
        if (!x.isDir && x.url === _bmUrl) {
          bookmark = x;
          pos = index;
        }
      });
      if (bookmark) {
        form.setValues({
          pos,
          url: bookmark.url,
          title: bookmark.title,
          folder: curFolder,
          taggedPersons: bookmark.taggedPersons,
        });
        setOrigTaggedPersons(bookmark.taggedPersons);
        setOpenDialog(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextBookmarks, curFolder, defaultFolderName]
  );

  useEffect(() => {
    if (operation !== BOOKMARK_OPERATION.NONE) {
      resolveBookmark(operation, bmUrl);
    }
  }, [bmUrl, operation, resolveBookmark]);

  const closeDialog = () => {
    // Remove qs before closing and mark current as selected
    if (openDialog) {
      navigate(getBookmarksPanelUrl({ folderContext: curFolder }), {
        replace: true,
      });
    }
    const { pos } = form.values;
    if (operation === BOOKMARK_OPERATION.EDIT) {
      handleScroll(pos);
      handleSelectedChange(pos, true);
    }
    form.reset();
    resetBookmarkOperation();
    setOpenDialog(false);
  };

  const handleDelete = () => {
    const { pos, url } = form.values;
    onDelete(pos, url);
    closeDialog();
  };

  const handleSave = (values: typeof form.values) => {
    onSave(
      values.url,
      values.title,
      curFolder,
      values.folder,
      values.pos,
      origTaggedPersons,
      values.taggedPersons
    );
    closeDialog();
  };

  return (
    <Modal
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      opened={openDialog}
      onClose={closeDialog}
      title={HEADING[operation]}
    >
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Title"
            placeholder="Enter bookmark title"
            data-autofocus
            {...form.getInputProps('title')}
          />
          <TextInput
            withAsterisk
            label="Url"
            placeholder="Url"
            data-autofocus
            readOnly
            {...form.getInputProps('url')}
          />
          <Select
            withAsterisk
            maxDropdownHeight={120}
            label="Folder"
            data={folderNamesList}
            {...form.getInputProps('folder')}
          />
          <PersonSelect formProps={form.getInputProps('taggedPersons')} />
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button type="submit" color="teal">
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
});

export default BookmarkAddEditDialog;
