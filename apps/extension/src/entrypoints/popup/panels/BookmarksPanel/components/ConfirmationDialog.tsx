import { noOp } from '@bypass/shared';
import { Button, Group, Modal } from '@mantine/core';
import { memo } from 'react';

interface Props {
  onClose: VoidFunction;
  onOk: VoidFunction;
  isOpen: boolean;
}

const ConfirmationDialog = memo<Props>(({ onClose, onOk, isOpen }) => {
  return (
    <Modal
      centered
      withCloseButton={false}
      closeOnEscape={false}
      opened={isOpen}
      title="There are some unsaved changes"
      size="18.75rem"
      onClose={noOp}
    >
      <Group justify="flex-end" mt="lg">
        <Button color="red" onClick={onOk}>
          Discard
        </Button>
        <Button color="teal" onClick={onClose}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
});

export default ConfirmationDialog;
