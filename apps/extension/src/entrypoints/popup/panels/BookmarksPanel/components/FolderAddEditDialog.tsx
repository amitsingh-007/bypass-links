import { z } from 'zod/mini';
import { useForm } from '@tanstack/react-form';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@bypass/ui';
import { handleEscapeKey } from '@popup/utils/dialog';

interface Props {
  origName?: string;
  headerText: string;
  handleSave: (name: string) => void;
  isOpen: boolean;
  onClose: VoidFunction;
}

const formSchema = z.object({
  folderName: z.string().check(z.minLength(1, 'Required')),
});

export function FolderAddEditDialog({
  origName = '',
  headerText,
  handleSave,
  isOpen,
  onClose,
}: Props) {
  const form = useForm({
    defaultValues: {
      folderName: origName,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit({ value, formApi }) {
      if (value.folderName === origName) {
        formApi.setFieldMeta('folderName', (meta) => ({
          ...meta,
          errors: ["Can't be same as before"],
        }));
        return;
      }
      handleSave(value.folderName);
      formApi.reset();
      onClose();
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleEscapeKey}>
        <DialogHeader>
          <DialogTitle>{headerText}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="folderName">
            {(field) => (
              <Field>
                <FieldLabel>
                  Folder <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  data-autofocus
                  data-testid="folder-name-input"
                  placeholder="Enter folder name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button data-testid="dialog-save-button" type="submit">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
