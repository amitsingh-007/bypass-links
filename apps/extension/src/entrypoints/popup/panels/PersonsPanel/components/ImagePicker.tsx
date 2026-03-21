import { Header, getPersonImageName } from '@bypass/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Slider,
  Spinner,
} from '@bypass/ui';
import {
  type ChangeEventHandler,
  type ClipboardEventHandler,
  useRef,
  useState,
} from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import AvatarEditor from 'react-avatar-editor';
import wretch from 'wretch';
import { uploadFileToFirebase } from '../utils/uploadImage';

interface Props {
  uid: string;
  isOpen: boolean;
  onDialogClose: VoidFunction;
  handleImageSave: (fileName: string) => Promise<void> | void;
}

function ImagePicker({ uid, isOpen, onDialogClose, handleImageSave }: Props) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inputOrFileValue, setInputOrFileValue] = useState<string | File>('');
  const [debouncedInputUrl] = useDebouncedValue(inputOrFileValue, 500);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const imageCropperRef = useRef<AvatarEditor>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleImageUrlChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.value ?? '';
    setInputOrFileValue(nextValue);
    setIsLoadingImage(nextValue.trim().length > 0);
  };

  const handleImagePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const { items } = e.clipboardData;
    // First check for image files
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
      setIsLoadingImage(true);
      setInputOrFileValue(imageFile);
      return;
    }
    // If no image file, try to get text/URL
    const textData = e.clipboardData.getData('text');
    if (textData) {
      e.preventDefault();
      setIsLoadingImage(true);
      setInputOrFileValue(textData);
    }
  };

  const saveCroppedImage = async () => {
    if (!debouncedInputUrl || !imageCropperRef.current) {
      return;
    }
    try {
      setIsUploadingImage(true);
      const canvas = imageCropperRef.current.getImage().toDataURL();
      const croppedImage = await wretch().get(canvas).blob();
      const fileName = getPersonImageName(uid);
      await uploadFileToFirebase(croppedImage, fileName);
      onDialogClose();
      await handleImageSave(fileName);
    } catch (error) {
      console.error('Error while cropping the image', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const disableControls = isLoadingImage || !debouncedInputUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDialogClose()}>
      <DialogContent
        className="
          inset-0! block max-w-none! translate-0! overflow-hidden rounded-none
          p-0
        "
        showCloseButton={false}
      >
        <div className="size-full bg-background">
          {isUploadingImage && (
            <div
              className="
                absolute inset-0 z-50 flex items-center justify-center
                bg-black/50
              "
              data-testid="uploading-overlay"
            >
              <Spinner className="size-8" />
            </div>
          )}
          <DialogHeader className="px-0">
            <DialogTitle className="sr-only">Upload Image</DialogTitle>
          </DialogHeader>
          <Header text="Upload Image" onBackClick={onDialogClose} />
          <div className="relative flex w-full items-center justify-center p-4">
            {isLoadingImage && (
              <div className="absolute">
                <Spinner className="size-8" />
              </div>
            )}
            <AvatarEditor
              ref={imageCropperRef}
              image={debouncedInputUrl}
              crossOrigin="anonymous"
              // When changing this, change in upload API as well
              width={250}
              height={250}
              border={[270, 70]}
              borderRadius={4}
              scale={zoom}
              rotate={rotation}
              className="rounded-xl bg-black"
              onImageReady={() => setIsLoadingImage(false)}
            />
          </div>
          <div className="px-5">
            <div className="mx-auto mt-3 flex w-[85%] items-center gap-4">
              <Input
                placeholder="Enter image url"
                className="flex-1"
                value={
                  typeof inputOrFileValue === 'string' ? inputOrFileValue : ''
                }
                onChange={handleImageUrlChange}
                onPaste={handleImagePaste}
              />
              <Button
                data-testid="save-cropped-image"
                disabled={disableControls}
                onClick={saveCroppedImage}
              >
                Save Image
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              <div className="w-[40%]">
                <span className="mb-2 block text-sm">Zoom</span>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.001}
                  disabled={disableControls}
                  thumbAlignment="center"
                  onValueChange={(value) => {
                    const val = Array.isArray(value) ? value[0] : value;
                    setZoom(val ?? 1);
                  }}
                />
              </div>
              <div className="w-[40%]">
                <span className="mb-2 block text-sm">Rotate</span>
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  disabled={disableControls}
                  thumbAlignment="center"
                  onValueChange={(value) => {
                    const val = Array.isArray(value) ? value[0] : value;
                    setRotation(val ?? 0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImagePicker;
