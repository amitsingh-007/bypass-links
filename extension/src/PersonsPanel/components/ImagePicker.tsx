import Header from '@bypass/shared/components/Header';
import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { FIREBASE_STORAGE_REF } from '@constants/index';
import { uploadImageToFirebase } from '@helpers/firebase/storage';
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
import imageCompression from 'browser-image-compression';
import { memo, useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import getCroppedImg from '../utils/cropImage';

const ASPECT_RATIO = 1; //Square image allowed
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 200 / 1024, //max 200KB size
  maxWidthOrHeight: 250, //max 200px square size image
};

interface Props {
  uid: string;
  isOpen: boolean;
  onDialogClose: VoidFunction;
  handleImageSave: (imageRef: string) => void;
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({} as Area);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const saveCroppedImage = useCallback(async () => {
    if (!inputImageUrl) {
      return;
    }
    try {
      const imageRef = `${FIREBASE_STORAGE_REF.persons}/${uid}.jpeg`;
      setIsUploadingImage(true);
      const croppedImage = await getCroppedImg(
        inputImageUrl,
        croppedAreaPixels
      );
      const compressedImage = await imageCompression(
        new File([croppedImage], `${uid}.jpeg`, { type: croppedImage.type }),
        IMAGE_COMPRESSION_OPTIONS
      );
      await uploadImageToFirebase(compressedImage, imageRef);
      handleImageSave(imageRef);
      onDialogClose();
    } catch (error) {
      console.error('Error while cropping the image', error);
    } finally {
      setIsUploadingImage(false);
    }
  }, [croppedAreaPixels, handleImageSave, inputImageUrl, onDialogClose, uid]);

  return (
    <Modal
      opened={isOpen}
      onClose={onDialogClose}
      fullScreen
      zIndex={1002}
      withCloseButton={false}
      styles={{
        modal: { padding: '0 !important' },
        title: { flex: 1, marginRight: 0 },
        header: { marginBottom: 0 },
      }}
    >
      <LoadingOverlay visible={isUploadingImage} />
      <Header text="Upload Image" onBackClick={onDialogClose} />
      <Box w="100%" h={396} sx={{ position: 'relative', overflow: 'hidden' }}>
        <Cropper
          cropShape="round"
          showGrid={false}
          image={inputImageUrl}
          crop={crop}
          zoom={zoom}
          aspect={ASPECT_RATIO}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </Box>
      <Box px={20} pt={20}>
        <Group sx={{ justifyContent: 'center' }}>
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
        <Group mt={20} sx={{ justifyContent: 'center' }}>
          <Button radius="xl" color="teal" onClick={saveCroppedImage}>
            Save Cropped Image
          </Button>
        </Group>
      </Box>
    </Modal>
  );
});

export default ImagePicker;
