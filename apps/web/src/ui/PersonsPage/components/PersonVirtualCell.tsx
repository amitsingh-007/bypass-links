import { IPerson, Person } from '@bypass/shared';
import { Box } from '@mantine/core';

interface Props {
  person: IPerson;
}

const PersonVirtualCell = ({ person }: Props) => {
  return (
    <Box p="0.75rem" h="100%">
      <Person person={person} />
    </Box>
  );
};

export default PersonVirtualCell;
