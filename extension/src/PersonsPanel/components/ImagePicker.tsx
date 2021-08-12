import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Slide,
  Slider,
  SliderUnstyledTypeMap,
  TextField,
  Typography,
} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import imageCompression from "browser-image-compression";
import PanelHeading from "GlobalComponents/PanelHeading";
import { FIREBASE_STORAGE_REF } from "GlobalConstants";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { uploadImageToFirebase } from "GlobalHelpers/firebase/storage";
import { VoidFunction } from "GlobalInterfaces/custom";
import { forwardRef, memo, useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";
import getCroppedImg from "../utils/cropImage";

const ROTATION = 0; //No rotation allowed
const ASPECT_RATIO = 1; //Square image allowed
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 200 / 1024, //max 200KB size
  maxWidthOrHeight: 250, //max 200px square size image
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

interface Props {
  uid: string;
  isOpen: boolean;
  onDialogClose: VoidFunction;
  handleImageSave: (imageRef: string) => void;
}

const ImagePicker = memo<Props>(
  ({ uid, isOpen, onDialogClose, handleImageSave }) => {
    const inputImageUrlRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [inputImageUrl, setInputImageUrl] = useState("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>(
      {} as Area
    );

    const handleImageLoadClick = () => {
      setInputImageUrl(inputImageUrlRef?.current?.value ?? "");
    };

    const handleZoomChange: SliderUnstyledTypeMap["props"]["onChange"] = (
      _event,
      zoom
    ) => setZoom(zoom as number);

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
      if (!inputImageUrl) {
        return;
      }
      try {
        const imageRef = `${FIREBASE_STORAGE_REF.persons}/${uid}.jpeg`;
        setIsUploadingImage(true);
        const croppedImage = await getCroppedImg(
          inputImageUrl,
          croppedAreaPixels,
          ROTATION
        );
        const compressedImage = await imageCompression(
          new File([croppedImage], `${uid}.jpeg`, { type: croppedImage.type }),
          IMAGE_COMPRESSION_OPTIONS
        );
        await uploadImageToFirebase(compressedImage, imageRef);
        handleImageSave(imageRef);
        onDialogClose();
      } catch (error) {
        console.error("Error while cropping the image", error);
      } finally {
        setIsUploadingImage(false);
      }
    }, [croppedAreaPixels, handleImageSave, inputImageUrl, onDialogClose, uid]);

    const onClose = useCallback(() => {
      onDialogClose();
    }, [onDialogClose]);

    return (
      <Dialog
        fullScreen
        open={isOpen}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        {isUploadingImage && (
          <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%" }}>
            <LinearProgress color="secondary" />
          </Box>
        )}
        <DialogTitle sx={{ padding: "0 6px", backgroundColor: BG_COLOR_DARK }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="Discard"
              component="span"
              style={COLOR.red}
              onClick={onDialogClose}
              title="Discard and Close"
            >
              <ArrowBackTwoToneIcon fontSize="large" />
            </IconButton>
            <PanelHeading heading="UPLOAD IMAGE" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "396px",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <Cropper
              cropShape="round"
              showGrid={false}
              image={inputImageUrl}
              crop={crop}
              zoom={zoom}
              rotation={ROTATION}
              aspect={ASPECT_RATIO}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </Box>
          <Box sx={{ padding: "0 20px" }}>
            <Box
              component="form"
              sx={{ display: "flex", marginTop: "18px" }}
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                handleImageLoadClick();
              }}
            >
              <TextField
                autoFocus
                inputRef={inputImageUrlRef}
                fullWidth
                size="small"
                label="Image Url"
                variant="outlined"
                color="primary"
                title={inputImageUrl}
                style={{ marginRight: "10px" }}
              />
              <Button type="submit" variant="outlined" color="secondary">
                <strong>Load</strong>
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "18px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "50%" }}>
                <Typography
                  id="zoom"
                  variant="overline"
                  style={{ marginRight: "20px", fontSize: "15px" }}
                >
                  Zoom
                </Typography>
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.001}
                  aria-labelledby="zoom"
                  valueLabelDisplay="auto"
                  onChange={handleZoomChange}
                  color="secondary"
                />
              </Box>
              <Button
                color="primary"
                variant="outlined"
                onClick={showCroppedImage}
              >
                <strong>Save Cropped Image</strong>
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ImagePicker;
