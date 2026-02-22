import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@bypass/ui';
import { noOp } from '@bypass/shared';
import { memo } from 'react';
import { handleEscapeKey } from '@popup/utils/dialog';

interface Props {
  onClose: VoidFunction;
  onOk: VoidFunction;
  isOpen: boolean;
}

const ConfirmationDialog = memo<Props>(({ onClose, onOk, isOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={noOp}>
      <DialogContent
        className="sm:max-w-80"
        showCloseButton={false}
        onKeyDown={handleEscapeKey}
      >
        <DialogHeader className="py-2">
          <DialogTitle>There are some unsaved changes</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 p-2">
          <Button variant="destructive" onClick={onOk}>
            Discard
          </Button>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ConfirmationDialog;
