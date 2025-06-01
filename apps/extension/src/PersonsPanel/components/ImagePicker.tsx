import { Header, getPersonImageName } from '@bypass/shared';
import {
  Box,
  Button,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  Slider,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import {
  type ChangeEventHandler,
  type ClipboardEventHandler,
  useRef,
  useState,
} from 'react';
import AvatarEditor from 'react-avatar-editor';
import wretch from 'wretch';
import { uploadFileToFirebase } from '../utils/uploadImage';
import styles from './styles/ImagePicker.module.css';

interface Props {
  uid: string;
  isOpen: boolean;
  onDialogClose: VoidFunction;
  handleImageSave: (fileName: string) => void;
}

const ImagePicker = ({
  uid,
  isOpen,
  onDialogClose,
  handleImageSave,
}: Props) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inputOrFile, setInputOrFile] = useDebouncedState<string | File>(
    '',
    500
  );
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const imageCropperRef = useRef<AvatarEditor>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleImageUrlChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setIsLoadingImage(true);
    setInputOrFile(e.target.value ?? '');
  };

  const handleImagePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    setIsLoadingImage(true);
    const { items } = e.clipboardData;
    for (const item of items) {
      const isImageType = item.type.includes('image/');
      if (!isImageType) {
        continue;
      }
      const imageFile = item.getAsFile();
      if (!imageFile) {
        continue;
      }
      e.preventDefault();
      setInputOrFile(imageFile);
      break;
    }
    setIsLoadingImage(false);
  };

  const saveCroppedImage = async () => {
    if (!inputOrFile || !imageCropperRef.current) {
      return;
    }
    try {
      setIsUploadingImage(true);
      const canvas = imageCropperRef.current.getImage().toDataURL();
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

  const disableControls = isLoadingImage || !inputOrFile;
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
      <Flex pos="relative" justify="center" align="center" w="100%" p={4}>
        {isLoadingImage && <Loader pos="absolute" size="lg" />}
        <AvatarEditor
          ref={imageCropperRef}
          image={inputOrFile}
          // When changing this, change in upload API as well
          width={250}
          height={250}
          border={[270, 70]}
          borderRadius={4}
          scale={zoom}
          rotate={rotation}
          className={styles.imageCropperCanvas}
          onImageReady={() => setIsLoadingImage(false)}
        />
      </Flex>
      <Box px="1.25rem">
        <Group justify="center" mt={6}>
          <TextInput
            placeholder="Enter image url"
            w="82%"
            data-autofocus
            value={typeof inputOrFile === 'string' ? inputOrFile : ''}
            onChange={handleImageUrlChange}
            onPaste={handleImagePaste}
          />
          <Box w="40%">
            <Text size="sm">Zoom</Text>
            <Slider
              radius="xl"
              value={zoom}
              onChange={setZoom}
              min={1}
              max={3}
              step={0.001}
              label={(value) => value.toFixed(1)}
              disabled={disableControls}
              color={zoom > 2 ? 'red' : 'blue'}
            />
          </Box>
          <Box w="40%">
            <Text size="sm">Rotate</Text>
            <Slider
              radius="xl"
              value={rotation}
              onChange={setRotation}
              min={0}
              max={360}
              disabled={disableControls}
            />
          </Box>
        </Group>
        <Group mt={8} justify="center">
          <Button
            disabled={disableControls}
            radius="xl"
            color="teal"
            onClick={saveCroppedImage}
          >
            Save Cropped Image
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default ImagePicker;
