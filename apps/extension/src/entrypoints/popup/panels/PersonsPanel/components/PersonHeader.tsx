import { Header, type IPerson } from '@bypass/shared';
import { Button, Switch } from '@bypass/ui';
import { UserAdd01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo, useState } from 'react';
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
    const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

    const toggleAddPersonDialog = () => {
      setShowAddPersonDialog(!showAddPersonDialog);
    };

    const handlePersonSave = async (person: IPerson) => {
      await handleAddPerson(person);
      toggleAddPersonDialog();
    };

    return (
      <>
        <Header text={persons?.length || 0} onSearchChange={onSearchChange}>
          <Button
            disabled={isFetching}
            variant="secondary"
            className="font-medium"
            onClick={toggleAddPersonDialog}
          >
            <HugeiconsIcon icon={UserAdd01Icon} />
            Add
          </Button>
          <div className="flex items-center gap-2">
            <Switch
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
            onClose={toggleAddPersonDialog}
          />
        )}
      </>
    );
  }
);

export default PersonHeader;
