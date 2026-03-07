import { z } from 'zod/mini';
import { useForm } from '@tanstack/react-form';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useShallow } from 'zustand/react/shallow';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bypass/ui';
import {
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getDecodedFolderList,
  getDefaultFolder,
  ROOT_FOLDER_ID,
  type ITransformedBookmark,
} from '@bypass/shared';
import { getCurrentTab } from '@popup/utils/tabs';
import { handleEscapeKey } from '@popup/utils/dialog';
import useBookmarkRouteStore from '../store/useBookmarkRouteStore';
import useBookmarkStore from '../store/useBookmarkStore';
import PersonSelect from './PersonSelect';

const HEADING = {
  [EBookmarkOperation.NONE]: '',
  [EBookmarkOperation.ADD]: 'Add bookmark',
  [EBookmarkOperation.EDIT]: 'Edit bookmark',
};

interface Props {
  curFolderId: string;
  handleScroll: (pos: number) => void;
}

const formSchema = z.object({
  id: z.string(),
  pos: z.number(),
  url: z.url('Invalid URL format'),
  title: z.string().check(z.minLength(1, 'Required')),
  folderId: z.string().check(z.minLength(1, 'Required')),
  taggedPersons: z.array(z.string()),
});

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
  const [openDialog, dialogHandlers] = useDisclosure(false);

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

  const form = useForm({
    defaultValues: {
      id: '',
      pos: -1,
      url: '',
      title: '',
      folderId: ROOT_FOLDER_ID,
      taggedPersons: [] as string[],
    },
    validators: {
      onSubmit: formSchema,
    },
    async onSubmit({ value }) {
      const updatedBookmarkData: ITransformedBookmark = {
        id: value.id,
        url: value.url,
        title: value.title,
        isDir: false,
        taggedPersons: value.taggedPersons,
      };
      const isSaved = handleBookmarkSave(
        updatedBookmarkData,
        curFolderId,
        value.folderId
      );
      if (isSaved) {
        closeDialog();
      }
    },
  });

  const resolveBookmark = useCallback(
    async (_operation: EBookmarkOperation, _bmUrl: string) => {
      if (_operation === EBookmarkOperation.ADD) {
        const { title = '' } = await getCurrentTab();
        form.setFieldValue('id', crypto.randomUUID());
        form.setFieldValue('pos', contextBookmarks.length);
        form.setFieldValue('url', _bmUrl);
        form.setFieldValue('title', title);
        form.setFieldValue('folderId', defaultFolderId ?? ROOT_FOLDER_ID);
        form.setFieldValue('taggedPersons', []);
        dialogHandlers.open();
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
        form.setFieldValue('id', bookmark.id);
        form.setFieldValue('pos', pos);
        form.setFieldValue('url', bookmark.url);
        form.setFieldValue('title', bookmark.title);
        form.setFieldValue('folderId', curFolderId);
        form.setFieldValue('taggedPersons', bookmark.taggedPersons);
        dialogHandlers.open();
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
    if (openDialog) {
      navigate(getBookmarksPanelUrl({ folderId: curFolderId }), {
        replace: true,
      });
    }
    const pos = form.getFieldValue('pos');
    if (operation === EBookmarkOperation.EDIT) {
      handleScroll(pos);
      handleSelectedChange(pos, true);
    }
    form.reset();
    resetBookmarkOperation();
    dialogHandlers.close();
  };

  const handleDelete = () => {
    handleUrlRemove(form.getFieldValue('id'));
    closeDialog();
  };

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleEscapeKey}>
        <DialogHeader>
          <DialogTitle>{HEADING[operation]}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <Field>
                <FieldLabel>
                  Title <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  data-testid="bookmark-title-input"
                  placeholder="Enter bookmark title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="url">
            {(field) => (
              <Field>
                <FieldLabel>
                  URL <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  data-testid="bookmark-url-input"
                  placeholder="Enter bookmark URL"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="folderId">
            {(field) => {
              const selectedFolder = folderOptions.find(
                (opt) => opt.value === field.state.value
              );
              return (
                <Field>
                  <FieldLabel>
                    Folder <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value ?? '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select folder">
                        {selectedFolder?.label ?? 'Select folder'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {folderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="taggedPersons">
            {(field) => (
              <PersonSelect
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <DialogFooter
            className="
              flex flex-col gap-2 p-2
              sm:flex-row
            "
          >
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button data-testid="dialog-save-button" type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookmarkAddEditDialog;
