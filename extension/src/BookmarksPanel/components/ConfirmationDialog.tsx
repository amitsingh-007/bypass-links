import { VoidFunction } from '@bypass/shared/interfaces/custom';
import { Button, Group, Modal } from '@mantine/core';
import { memo } from 'react';

interface Props {
  onClose: VoidFunction;
  onOk: VoidFunction;
  isOpen: boolean;
}

const ConfirmationDialog = memo<Props>(function ConfirmationDialog({
  onClose,
  onOk,
  isOpen,
}) {
  return (
    <Modal
      onClose={() => undefined}
      withCloseButton={false}
      closeOnEscape={false}
      centered
      opened={isOpen}
      title="There are some unsaved changes"
    >
      <Group position="right" mt="lg">
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
