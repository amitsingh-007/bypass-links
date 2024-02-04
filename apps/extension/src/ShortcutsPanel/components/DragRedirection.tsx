import { IRedirection, useDndSortable } from '@bypass/shared';
import { Box } from '@mantine/core';
import { getRedirectionId } from '../utils';
import RedirectionRule from './RedirectionRule';

interface Props {
  redirection: IRedirection;
  pos: number;
  handleRemoveRule: (pos: number) => void;
  handleSaveRule: (redirection: IRedirection, pos: number) => void;
}

const DragRedirection = ({ redirection, ...restProps }: Props) => {
  const id = getRedirectionId(redirection);
  const { listeners, setNodeRef, attributes, containerStyles } =
    useDndSortable(id);

  return (
    <Box style={containerStyles} tabIndex={0}>
      <RedirectionRule
        {...redirection}
        {...restProps}
        dndProps={{
          listeners,
          setNodeRef,
          attributes,
        }}
      />
    </Box>
  );
};

export default DragRedirection;
