import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";

const ConfirmationDialog = memo(({ onClose, onOk, isOpen }) => {
  const handleCancel = () => {
    onClose();
  };
  const handleOk = () => {
    onOk();
  };

  return (
    <Dialog disableEscapeKeyDown maxWidth="xs" open={isOpen}>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        <Box>Do you really want to continue and discard all the changes?</Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} style={COLOR.red}>
          Cancel
        </Button>
        <Button onClick={handleOk} style={COLOR.green}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmationDialog;
