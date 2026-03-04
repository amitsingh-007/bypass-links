import { Header, type IPerson } from '@bypass/shared';
import { Button, Switch } from '@bypass/ui';
import { useDisclosure } from '@mantine/hooks';
import { UserAdd01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import AddOrEditPersonDialog from './AddOrEditPersonDialog';

interface Props {
  isFetching: boolean;
  handleAddPerson: (person: IPerson) => Promise<void>;
  persons: IPerson[];
  onSearchChange: (text: string) => void;
  orderByRecency: boolean;
  toggleOrderByRecency: VoidFunction;
}

const PersonHeader = memo<Props>(
  ({
    isFetching,
    handleAddPerson,
    persons,
    onSearchChange,
    orderByRecency,
    toggleOrderByRecency,
  }) => {
    const [showAddPersonDialog, addPersonDialogHandlers] = useDisclosure(false);

    const handlePersonSave = async (person: IPerson) => {
      await handleAddPerson(person);
      addPersonDialogHandlers.close();
    };

    return (
      <>
        <Header text={persons?.length || 0} onSearchChange={onSearchChange}>
          <Button
            disabled={isFetching}
            variant="secondary"
            className="font-medium"
            onClick={addPersonDialogHandlers.open}
          >
            <HugeiconsIcon icon={UserAdd01Icon} />
            Add
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              data-testid="recency-switch"
              checked={orderByRecency}
              onCheckedChange={toggleOrderByRecency}
            />
            <span className="text-sm">Recency</span>
          </div>
        </Header>
        {showAddPersonDialog && (
          <AddOrEditPersonDialog
            isOpen={showAddPersonDialog}
            handleSaveClick={handlePersonSave}
            onClose={addPersonDialogHandlers.close}
          />
        )}
      </>
    );
  }
);

export default PersonHeader;
