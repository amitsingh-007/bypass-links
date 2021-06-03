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
  TextField,
  Typography,
} from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import imageCompression from "browser-image-compression";
import PanelHeading from "GlobalComponents/PanelHeading";
import { BG_COLOR_DARK, COLOR } from "GlobalConstants/color";
import { FIREBASE_STORAGE_REF } from "GlobalConstants";
import { uploadImageToFirebase } from "GlobalUtils/firebase";
import { forwardRef, memo, useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

const ROTATION = 0; //No rotation allowed
const ASPECT_RATIO = 1; //Square image allowed
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 200 / 1024, //max 200KB size
  maxWidthOrHeight: 250, //max 200px square size image
};

const Transition = forwardRef((props, ref) => (
  <Slide direction="left" {...props} ref={ref} />
));

const ImagePicker = memo(({ uid, isOpen, onDialogClose, handleImageSave }) => {
  const inputImageUrlRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inputImageUrl, setInputImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleImageLoadClick = () => {
    setInputImageUrl(inputImageUrlRef.current.value);
  };
  const handleZoomChange = (_event, zoom) => setZoom(zoom);

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
        croppedImage,
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
      {isUploadingImage && <LinearProgress color="secondary" />}
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
            onSubmit={(e) => {
              e.preventDefault();
              handleImageLoadClick(e);
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
});

export default ImagePicker;
