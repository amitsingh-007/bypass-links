import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
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
        <Button autoFocus onClick={handleCancel} style={COLOR.red}>
          <strong>Cancel</strong>
        </Button>
        <Button onClick={handleOk} style={COLOR.green}>
          <strong>Discard</strong>
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmationDialog;
