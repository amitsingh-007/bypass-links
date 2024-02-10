import { Header, getPersonImageName } from '@bypass/shared';
import {
  Box,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  Slider,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { memo, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import wretch from 'wretch';
import { uploadFileToFirebase } from '../utils/uploadImage';

interface Props {
  uid: string;
  isOpen: boolean;
  onDialogClose: VoidFunction;
  handleImageSave: (fileName: string) => void;
}

const ImagePicker = memo<Props>(function ImagePicker({
  uid,
  isOpen,
  onDialogClose,
  handleImageSave,
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inputImageUrl, setInputImageUrl] = useDebouncedState('', 500);
  const [zoom, setZoom] = useState(1);
  const imageCropperRef = useRef<any>(null);

  const saveCroppedImage = async () => {
    if (!inputImageUrl) {
      return;
    }
    try {
      setIsUploadingImage(true);
      const canvas = imageCropperRef.current?.getImage().toDataURL();
      const croppedImage = await wretch().get(canvas).blob();
      const fileName = getPersonImageName(uid);
      await uploadFileToFirebase(croppedImage, fileName);
      handleImageSave(fileName);
      onDialogClose();
    } catch (error) {
      console.error('Error while cropping the image', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onDialogClose}
      fullScreen
      zIndex={1002}
      withCloseButton={false}
      styles={{
        body: { padding: 'unset' },
        content: { '> div': { maxHeight: 'unset' } },
      }}
    >
      <LoadingOverlay visible={isUploadingImage} />
      <Header text="Upload Image" onBackClick={onDialogClose} />
      <Flex
        justify="center"
        align="center"
        w="100%"
        h="24.75rem"
        pos="relative"
      >
        <AvatarEditor
          ref={imageCropperRef}
          image={inputImageUrl}
          // When changing this, change in upload API as well
          width={250}
          height={250}
          border={[270, 70]}
          scale={zoom}
          rotate={0}
        />
      </Flex>
      <Box px="1.25rem" pt="1.25rem">
        <Group justify="center">
          <TextInput
            placeholder="Enter image link"
            onChange={(e) => setInputImageUrl(e.target.value ?? '')}
            data-autofocus
            w="40%"
          />
          <Slider
            radius="xl"
            value={zoom}
            onChange={setZoom}
            min={1}
            max={3}
            step={0.001}
            label={(value) => value.toFixed(1)}
            disabled={!inputImageUrl}
            color={zoom > 2 ? 'red' : 'blue'}
            w="40%"
          />
        </Group>
        <Group mt="1.25rem" justify="center">
          <Button radius="xl" color="teal" onClick={saveCroppedImage}>
            Save Cropped Image
          </Button>
        </Group>
      </Box>
    </Modal>
  );
});

export default ImagePicker;
