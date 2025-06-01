import { type IPerson, usePerson } from '@bypass/shared';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Modal,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import md5 from 'md5';
import { useCallback, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import ImagePicker from './ImagePicker';
import styles from './styles/AddOrEditPersonDialog.module.css';
import { trpcApi } from '@/apis/trpcApi';

const imageSize = 200;

interface Props {
  person?: IPerson;
  isOpen: boolean;
  onClose: VoidFunction;
  handleSaveClick: (person: IPerson) => Promise<void>;
}

interface IForm {
  uid?: string;
  name: string;
}

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

  const form = useForm<IForm>({
    initialValues: {
      uid: person?.uid,
      name: person?.name ?? '',
    },
    validate: {
      name: (value) => (value ? null : 'Required'),
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
    } else {
      form.setFieldValue('uid', md5(Date.now().toString()));
    }
  }, [initImageUrl, person]);

  const handleImageCropSave = async (fileName: string) => {
    const url = await trpcApi.storage.getDownloadUrl.query(fileName);
    setImageUrl(url);
  };

  const toggleImagePicker = () => setShowImagePicker(!showImagePicker);

  const handleSave = async (values: typeof form.values) => {
    const { uid, name } = values;
    if (!uid) {
      return;
    }

    setIsLoading(true);
    await handleSaveClick({
      uid,
      name,
    });
    setIsLoading(false);
  };

  const { uid } = form.values;
  return (
    <>
      <Modal
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
        opened={isOpen}
        title={person ? 'Edit Person' : 'Add Person'}
        padding="2.5rem"
        onClose={onClose}
      >
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack>
            <Center>
              <Box pos="relative">
                <Avatar
                  alt={imageUrl || 'No Image'}
                  src={imageUrl}
                  size={imageSize}
                  radius="xl"
                />
                <Box
                  pos="absolute"
                  top="50%"
                  left="50%"
                  className={styles.editIconWrapper}
                >
                  <ActionIcon
                    c="white"
                    radius="xl"
                    size={imageSize}
                    onClick={toggleImagePicker}
                  >
                    <AiFillEdit size="25px" />
                  </ActionIcon>
                </Box>
              </Box>
            </Center>
            <TextInput
              withAsterisk
              data-autofocus
              label="Name"
              placeholder="Enter name"
              {...form.getInputProps('name')}
            />
            <Button type="submit" color="teal" loading={isLoading}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
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
