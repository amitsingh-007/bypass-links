import {
  DEFAULT_BOOKMARK_FOLDER,
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getDecodedFolderList,
  getDefaultFolder,
  type ITransformedBookmark,
} from '@bypass/shared';
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import md5 from 'md5';
import useBookmarkStore from '../store/useBookmarkStore';
import PersonSelect from './PersonSelect';
import { getCurrentTab } from '@/utils/tabs';
import useBookmarkRouteStore from '@/BookmarksPanel/store/useBookmarkRouteStore';

const HEADING = {
  [EBookmarkOperation.NONE]: '',
  [EBookmarkOperation.ADD]: 'Add bookmark',
  [EBookmarkOperation.EDIT]: 'Edit bookmark',
};

interface Props {
  curFolder: string;
  handleScroll: (pos: number) => void;
}

interface IForm {
  pos: number;
  url: string;
  title: string;
  folder: string;
  taggedPersons: string[];
}

const validateHandler = (value: string) => (value?.trim() ? null : 'Required');

function BookmarkAddEditDialog({ curFolder, handleScroll }: Props) {
  const [, navigate] = useLocation();
  const { bookmarkOperation, resetBookmarkOperation } = useBookmarkRouteStore(
    useShallow((state) => ({
      bookmarkOperation: state.bookmarkOperation,
      resetBookmarkOperation: state.resetBookmarkOperation,
    }))
  );
  const {
    folderList,
    contextBookmarks,
    handleBookmarkSave,
    handleUrlRemove,
    handleSelectedChange,
  } = useBookmarkStore(
    useShallow((state) => ({
      contextBookmarks: state.contextBookmarks,
      folderList: state.folderList,
      handleBookmarkSave: state.handleBookmarkSave,
      handleUrlRemove: state.handleUrlRemove,
      handleSelectedChange: state.handleSelectedChange,
    }))
  );
  const { operation, url: bmUrl } = bookmarkOperation;
  const [openDialog, setOpenDialog] = useState(false);

  const { folderNamesList, defaultFolderName } = useMemo(() => {
    const decodedFolderList = getDecodedFolderList(folderList);
    const folderNames = decodedFolderList.map((x) => x.name);
    const defaultFolder = getDefaultFolder(decodedFolderList);
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
    async (_operation: EBookmarkOperation, _bmUrl: string) => {
      if (_operation === EBookmarkOperation.ADD) {
        const { title = '' } = await getCurrentTab();
        form.setValues({
          pos: contextBookmarks.length,
          url: _bmUrl,
          title,
          folder: defaultFolderName ?? DEFAULT_BOOKMARK_FOLDER,
          taggedPersons: [],
        });
        setOpenDialog(true);
        return;
      }

      let bookmark: Required<ITransformedBookmark> | undefined;
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
        setOpenDialog(true);
      }
    },
    [contextBookmarks, curFolder, defaultFolderName]
  );

  useEffect(() => {
    if (operation !== EBookmarkOperation.NONE) {
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
    if (operation === EBookmarkOperation.EDIT) {
      handleScroll(pos);
      handleSelectedChange(pos, true);
    }
    form.reset();
    resetBookmarkOperation();
    setOpenDialog(false);
  };

  const handleDelete = () => {
    const { pos, url } = form.values;
    handleUrlRemove(pos, url);
    closeDialog();
  };

  const handleSave = (values: typeof form.values) => {
    const updatedBookmarkData: ITransformedBookmark = {
      id: md5(values.url),
      url: values.url,
      title: values.title,
      isDir: false,
      taggedPersons: values.taggedPersons,
    };
    handleBookmarkSave(
      updatedBookmarkData,
      curFolder,
      values.folder,
      values.pos
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
            maxDropdownHeight={148}
            label="Folder"
            data={folderNamesList}
            {...form.getInputProps('folder')}
            comboboxProps={{
              withinPortal: false,
              transitionProps: { transition: 'pop' },
            }}
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
}

export default BookmarkAddEditDialog;
