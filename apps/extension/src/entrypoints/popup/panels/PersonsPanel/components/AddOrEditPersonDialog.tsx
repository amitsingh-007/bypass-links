import { z } from 'zod/mini';
import { noOp, type IPerson, usePerson } from '@bypass/shared';
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
import { useForm, useStore } from '@tanstack/react-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserWarning03Icon } from '@hugeicons/core-free-icons';
import { useCallback, useEffect, useState } from 'react';
import ImagePicker from './ImagePicker';
import { trpcApi } from '@/apis/trpcApi';

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
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      uid: '',
      name: '',
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

  const initImageUrl = useCallback(
    async (uid: string) => {
      const image = await resolvePersonImageFromUid(uid);
      setImageUrl(image);
    },
    [resolvePersonImageFromUid]
  );

  useEffect(() => {
    if (person) {
      initImageUrl(person.uid);
      form.reset({
        uid: person.uid,
        name: person.name,
      });
    } else {
      setImageUrl('');
      form.reset({
        uid: crypto.randomUUID(),
        name: '',
      });
    }
  }, [form, initImageUrl, person]);

  const handleImageCropSave = async (fileName: string) => {
    const url = await trpcApi.storage.getDownloadUrl.query(fileName);
    setImageUrl(url);
  };

  const toggleImagePicker = () => setShowImagePicker(!showImagePicker);

  const uid = useStore(form.store, (state) => state.values.uid);

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
                  className="
                    rounded-xl
                    after:rounded-none after:border-0
                  "
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                >
                  <AvatarImage
                    src={imageUrl}
                    alt={imageUrl ?? 'No Image'}
                    className="rounded-xl"
                  />
                  <AvatarFallback className="rounded-xl">
                    <HugeiconsIcon icon={UserWarning03Icon} size={48} />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute inset-0 rounded-xl border-0"
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                  onClick={toggleImagePicker}
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

      {uid && (
        <ImagePicker
          uid={uid}
          isOpen={showImagePicker}
          handleImageSave={handleImageCropSave}
          onDialogClose={toggleImagePicker}
        />
      )}
    </>
  );
}

export default AddOrEditPersonDialog;
