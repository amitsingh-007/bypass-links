import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { VoidFunction } from "GlobalInterfaces/custom";
import { memo } from "react";

const ConfirmationDialog = memo<{
  onClose: VoidFunction;
  onOk: VoidFunction;
  isOpen: boolean;
}>(function ConfirmationDialog({ onClose, onOk, isOpen }) {
  const handleCancel = () => {
    onClose();
  };
  const handleOk = () => {
    onOk();
  };

  return (
    <Dialog disableEscapeKeyDown maxWidth="xs" open={isOpen}>
      <DialogContent>
        <Box>There are some unsaved changes</Box>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          variant="outlined"
          onClick={handleCancel}
          color="error"
        >
          <strong>Cancel</strong>
        </Button>
        <Button variant="outlined" onClick={handleOk} color="success">
          <strong>Discard</strong>
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmationDialog;
