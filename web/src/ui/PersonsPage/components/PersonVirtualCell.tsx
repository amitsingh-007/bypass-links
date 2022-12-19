import { Box } from '@mui/material';
import { memo } from 'react';
import { areEqual } from 'react-window';
import { IPerson } from '@bypass/common/components/Persons/interfaces/persons';
import { getReactKey } from '@bypass/common/components/Persons/utils';
import Person from '@bypass/common/components/Persons/components/Person';
import { GRID_COLUMN_SIZE } from '../constants';

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
  const index = getReactKey(rowIndex, columnIndex, GRID_COLUMN_SIZE);
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
