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

interface Props {
  onClose: VoidFunction;
  onOk: VoidFunction;
  isOpen: boolean;
}

const ConfirmationDialog = memo<Props>(({ onClose, onOk, isOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={noOp}>
      <DialogContent className="sm:max-w-75" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>There are some unsaved changes</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="destructive" size="sm" onClick={onOk}>
            Discard
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-teal-500 text-white hover:bg-teal-600"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ConfirmationDialog;
