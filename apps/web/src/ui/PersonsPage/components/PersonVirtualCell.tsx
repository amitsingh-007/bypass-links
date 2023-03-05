import {
  getColumnCount,
  getReactKey,
  IPerson,
  Person,
  usePlatform,
} from '@bypass/shared';
import { Box } from '@mantine/core';
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
  const isMobile = usePlatform();
  const { persons } = data;
  const index = getReactKey(rowIndex, columnIndex, getColumnCount(isMobile));
  const person = persons[index];

  if (index >= persons.length) {
    return null;
  }
  return (
    <Box style={style} p="0.75rem">
      <Person person={person} />
    </Box>
  );
}, areEqual);
PersonVirtualCell.displayName = 'PersonVirtualCell';

export default PersonVirtualCell;
