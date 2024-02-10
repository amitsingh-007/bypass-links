import { Header, getPersonImageName } from '@bypass/shared';
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Slider,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { memo, useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import getCroppedImg from '../utils/cropImage';
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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const onCropComplete = useCallback(
    (_croppedArea: Area, _croppedAreaPixels: Area) => {
      setCroppedAreaPixels(_croppedAreaPixels);
    },
    []
  );

  const saveCroppedImage = async () => {
    if (!inputImageUrl) {
      return;
    }
    try {
      setIsUploadingImage(true);
      const croppedImage = await getCroppedImg(
        inputImageUrl,
        croppedAreaPixels
      );
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
      <Box w="100%" h="24.75rem" pos="relative">
        <Cropper
          cropShape="round"
          showGrid={false}
          image={inputImageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </Box>
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
