import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface Props {
  origName?: string;
  headerText: string;
  handleSave: (name: string) => void;
  isOpen: boolean;
  onClose: VoidFunction;
}

export function FolderAddEditDialog({
  origName = '',
  headerText,
  handleSave,
  isOpen,
  onClose,
}: Props) {
  const form = useForm({
    initialValues: {
      folderName: origName,
    },
    validate: {
      folderName: (value) => {
        if (!value) {
          return "Can't be empty";
        }
        if (value === origName) {
          return "Can't be same as before";
        }
        return null;
      },
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal centered opened={isOpen} title={headerText} onClose={handleClose}>
      <form
        onSubmit={form.onSubmit((values) => {
          handleSave(values.folderName);
          handleClose();
        })}
      >
        <TextInput
          withAsterisk
          data-autofocus
          label="Folder"
          placeholder="Enter folder name"
          {...form.getInputProps('folderName')}
        />
        <Group justify="end" mt="md">
          <Button type="submit" color="teal">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
