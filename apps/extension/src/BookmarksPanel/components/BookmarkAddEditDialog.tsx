import {
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getDecodedFolderList,
  getDefaultFolder,
  ROOT_FOLDER_ID,
  type ITransformedBookmark,
} from '@bypass/shared';
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
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
  curFolderId: string;
  handleScroll: (pos: number) => void;
}

interface IForm {
  id: string;
  pos: number;
  url: string;
  title: string;
  folderId: string;
  taggedPersons: string[];
}

const validateHandler = (value: string) => (value?.trim() ? null : 'Required');

const validateUrl = (value: string) => {
  if (!value?.trim()) {
    return 'Required';
  }
  if (!URL.canParse(value)) {
    return 'Invalid URL format';
  }
  return null;
};

function BookmarkAddEditDialog({ curFolderId, handleScroll }: Props) {
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

  const { folderOptions, defaultFolderId } = useMemo(() => {
    const decodedFolderList = getDecodedFolderList(folderList);
    const options = decodedFolderList.map((x) => ({
      value: x.id,
      label: x.name,
    }));
    const defaultFolder = getDefaultFolder(decodedFolderList);
    return {
      folderOptions: options,
      defaultFolderId: defaultFolder?.id,
    };
  }, [folderList]);

  const form = useForm<IForm>({
    initialValues: {
      id: '',
      pos: -1,
      url: '',
      title: '',
      folderId: ROOT_FOLDER_ID,
      taggedPersons: [],
    },
    validate: {
      url: validateUrl,
      title: validateHandler,
      folderId: validateHandler,
    },
  });

  const resolveBookmark = useCallback(
    async (_operation: EBookmarkOperation, _bmUrl: string) => {
      if (_operation === EBookmarkOperation.ADD) {
        const { title = '' } = await getCurrentTab();
        form.setValues({
          id: crypto.randomUUID(),
          pos: contextBookmarks.length,
          url: _bmUrl,
          title,
          folderId: defaultFolderId ?? ROOT_FOLDER_ID,
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
          id: bookmark.id,
          pos,
          url: bookmark.url,
          title: bookmark.title,
          folderId: curFolderId,
          taggedPersons: bookmark.taggedPersons,
        });
        setOpenDialog(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextBookmarks, curFolderId, defaultFolderId]
  );

  useEffect(() => {
    if (operation !== EBookmarkOperation.NONE) {
      resolveBookmark(operation, bmUrl);
    }
  }, [bmUrl, operation, resolveBookmark]);

  const closeDialog = () => {
    // Remove qs before closing and mark current as selected
    if (openDialog) {
      navigate(getBookmarksPanelUrl({ folderId: curFolderId }), {
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
    handleUrlRemove(form.values.id);
    closeDialog();
  };

  const handleSave = (values: typeof form.values) => {
    const updatedBookmarkData: ITransformedBookmark = {
      id: values.id,
      url: values.url,
      title: values.title,
      isDir: false,
      taggedPersons: values.taggedPersons,
    };
    const isSaved = handleBookmarkSave(
      updatedBookmarkData,
      curFolderId,
      values.folderId
    );
    if (isSaved) {
      closeDialog();
    }
  };

  return (
    <Modal
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      opened={openDialog}
      title={HEADING[operation]}
      closeButtonProps={
        {
          'data-testid': 'modal-close-button',
        } as React.ComponentProps<'button'>
      }
      onClose={closeDialog}
    >
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Title"
            placeholder="Enter bookmark title"
            data-testid="bookmark-title-input"
            {...form.getInputProps('title')}
          />
          <TextInput
            withAsterisk
            label="Url"
            placeholder="Enter bookmark URL"
            data-testid="bookmark-url-input"
            {...form.getInputProps('url')}
          />
          <Select
            withAsterisk
            maxDropdownHeight={148}
            label="Folder"
            data={folderOptions}
            {...form.getInputProps('folderId')}
            comboboxProps={{
              withinPortal: false,
              transitionProps: { transition: 'pop' },
            }}
          />
          <PersonSelect formProps={form.getInputProps('taggedPersons')} />
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button type="submit" color="teal" data-testid="dialog-save-button">
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export default BookmarkAddEditDialog;
