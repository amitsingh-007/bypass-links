import { noOp, type IPerson, usePersonImage } from '@bypass/shared';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
} from '@bypass/ui';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { useEffect, useState } from 'react';
import { z } from 'zod/mini';

import { trpcApi } from '@/apis/trpcApi';

import ImagePicker from './ImagePicker';

const IMAGE_SIZE = 200;

interface Props {
  person?: IPerson;
  isOpen: boolean;
  onClose: VoidFunction;
  handleSaveClick: (person: IPerson) => Promise<void>;
}

const formSchema = z.object({
  uid: z.string(),
  name: z.string().check(z.minLength(1, 'Required')),
});

function AddOrEditPersonDialog({
  person,
  isOpen,
  onClose,
  handleSaveClick,
}: Props) {
  const [initialUid] = useState(() => crypto.randomUUID());
  const [isAvatarImageLoading, setIsAvatarImageLoading] = useState(false);
  const [showImagePicker, imagePickerHandlers] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      uid: person?.uid ?? initialUid,
      name: person?.name ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    async onSubmit({ value }) {
      const { uid, name } = value;
      if (!uid) {
        return;
      }

      setIsLoading(true);
      await handleSaveClick({
        uid,
        name,
      });
      setIsLoading(false);
    },
  });

  const uid = useSelector(form.store, (state) => state.values.uid);
  // Revalidation off so an optimistic upload isn't refetched back to the pre-save value
  const { data: imageUrl = '', mutate: mutateImage } = usePersonImage(uid, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    onSuccess: (image) => setIsAvatarImageLoading(Boolean(image)),
  });

  // Reset the form when the dialog opens for a different person
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const defaultValues = person
      ? { uid: person.uid, name: person.name }
      : { uid: crypto.randomUUID(), name: '' };
    form.reset(defaultValues);
  }, [form, isOpen, person]);

  const handleImageCropSave = async (fileName: string) => {
    setIsAvatarImageLoading(true);
    const url = await trpcApi.storage.getDownloadUrl.query(fileName);
    mutateImage(url, { revalidate: false });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={isLoading ? noOp : onClose}>
        <DialogContent showCloseButton={!isLoading}>
          <DialogHeader>
            <DialogTitle>{person ? 'Edit Person' : 'Add Person'}</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex justify-center">
              <div className="relative">
                <Avatar
                  className="overflow-hidden rounded-xl after:rounded-none after:border-0"
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                >
                  <AvatarImage
                    src={imageUrl}
                    alt={imageUrl ?? 'No Image'}
                    className={
                      isAvatarImageLoading && imageUrl
                        ? 'absolute inset-0 rounded-xl opacity-0'
                        : 'absolute inset-0 rounded-xl opacity-100'
                    }
                    onLoad={() => setIsAvatarImageLoading(false)}
                    onError={() => setIsAvatarImageLoading(false)}
                  />
                  <AvatarFallback className="absolute inset-0 rounded-xl">
                    <HugeiconsIcon icon={UserWarning03Icon} size={48} />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="ghost"
                  data-testid="change-avatar-button"
                  className="absolute inset-0 rounded-xl border-0"
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                  onClick={imagePickerHandlers.open}
                />
              </div>
            </div>

            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel>
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    data-autofocus
                    placeholder="Enter name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 size-4" />}
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ImagePicker
        uid={uid}
        isOpen={showImagePicker}
        handleImageSave={handleImageCropSave}
        onDialogClose={imagePickerHandlers.close}
      />
    </>
  );
}

export default AddOrEditPersonDialog;
