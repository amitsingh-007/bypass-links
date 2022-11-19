import { Box } from '@mui/material';
import { memo } from 'react';
import { areEqual } from 'react-window';
import { IPerson } from '@common/components/Persons/interfaces/persons';
import { getReactKey } from '../utils';
import Person, { Props as PersonProps } from './Person';

export interface VirtualCellProps {
  persons: IPerson[];
  handleEditPerson: PersonProps['handleEditPerson'];
  handlePersonDelete: PersonProps['handlePersonDelete'];
}

const VirtualCell = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: VirtualCellProps;
}>(({ columnIndex, rowIndex, data, style }) => {
  const { persons, handleEditPerson, handlePersonDelete } = data;
  const index = getReactKey(rowIndex, columnIndex);
  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style}>
      <Person
        person={persons[index]}
        handleEditPerson={handleEditPerson}
        handlePersonDelete={handlePersonDelete}
      />
    </Box>
  );
}, areEqual);
VirtualCell.displayName = 'VirtualCell';

export default VirtualCell;
