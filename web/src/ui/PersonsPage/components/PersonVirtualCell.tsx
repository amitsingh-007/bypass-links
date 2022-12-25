import Person from '@bypass/shared/components/Persons/components/Person';
import { IPerson } from '@bypass/shared/components/Persons/interfaces/persons';
import { getReactKey } from '@bypass/shared/components/Persons/utils';
import { Box } from '@mui/material';
import { memo } from 'react';
import { areEqual } from 'react-window';

interface PersonVirtualCellProps {
  persons: IPerson[];
}

const PersonVirtualCell = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: PersonVirtualCellProps;
}>(({ columnIndex, rowIndex, data, style }) => {
  const { persons } = data;
  const index = getReactKey(rowIndex, columnIndex);
  const person = persons[index];

  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style}>
      <Person person={person} />
    </Box>
  );
}, areEqual);
PersonVirtualCell.displayName = 'PersonVirtualCell';

export default PersonVirtualCell;
