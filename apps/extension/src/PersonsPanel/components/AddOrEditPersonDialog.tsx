import { trpcApi } from '@/apis/trpcApi';
import { IPerson, usePerson } from '@bypass/shared';
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
import { memo, useCallback, useEffect, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import ImagePicker from './ImagePicker';
import styles from './styles/AddOrEditPersonDialog.module.css';

const imageSize = 200;

interface Props {
  person?: IPerson;
  isOpen: boolean;
  onClose: VoidFunction;
  handleSaveClick: (person: IPerson) => void;
}

interface IForm {
  uid?: string;
  name: string;
}

const AddOrEditPersonDialog = memo<Props>(function AddOrEditPersonDialog({
  person,
  isOpen,
  onClose,
  handleSaveClick,
}) {
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initImageUrl, person]);

  const handleImageCropSave = async (fileName: string) => {
    const url = await trpcApi.storage.getDownloadUrl.query(fileName);
    setImageUrl(url);
  };

  const toggleImagePicker = () => setShowImagePicker(!showImagePicker);

  const handleSave = (values: typeof form.values) => {
    const { uid, name } = values;
    if (!uid) {
      return;
    }
    handleSaveClick({
      uid,
      name,
      taggedUrls: person?.taggedUrls || [],
    });
  };

  const { uid } = form.values;
  return (
    <>
      <Modal
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        opened={isOpen}
        onClose={onClose}
        title={person ? 'Edit Person' : 'Add Person'}
        padding="2.5rem"
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
              label="Name"
              placeholder="Enter name"
              data-autofocus
              {...form.getInputProps('name')}
            />
            <Button type="submit" color="teal">
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
      {uid && (
        <ImagePicker
          uid={uid}
          isOpen={showImagePicker}
          onDialogClose={toggleImagePicker}
          handleImageSave={handleImageCropSave}
        />
      )}
    </>
  );
});

export default AddOrEditPersonDialog;
