import { IRedirections, noOp } from '@bypass/shared';
import { Active } from '@dnd-kit/core';
import RedirectionRule from './RedirectionRule';

interface Props {
  redirections: IRedirections;
  draggingNode: Active;
}

const DragClone = ({ redirections, draggingNode }: Props) => {
  const index = draggingNode.data.current?.sortable?.index;
  const redirection = redirections[index];

  return (
    <RedirectionRule
      {...redirection}
      pos={-1}
      handleRemoveRule={noOp}
      handleSaveRule={noOp}
    />
  );
};

export default DragClone;
