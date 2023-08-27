import { IRedirection } from '@/BackgroundScript/interfaces/redirections';
import { useDndSortable } from '@bypass/shared';
import { Box } from '@mantine/core';
import { getRedirectionId } from '../utils';
import RedirectionRule from './RedirectionRule';

interface Props {
  redirection: IRedirection;
  pos: number;
  handleRemoveRule: any;
  handleSaveRule: any;
}

const DragRedirection = ({ redirection, ...restProps }: Props) => {
  const id = getRedirectionId(redirection);
  const { transition, listeners, setNodeRef, attributes, containerStyles } =
    useDndSortable(id);

  return (
    <Box style={{ transition }} sx={containerStyles} tabIndex={0}>
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
