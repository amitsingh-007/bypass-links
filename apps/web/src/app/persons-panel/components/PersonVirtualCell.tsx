import { type IPerson, Person } from '@bypass/shared';

interface Props {
  person: IPerson;
}

function PersonVirtualCell({ person }: Props) {
  return (
    <div className="h-full p-3">
      <Person person={person} />
    </div>
  );
}

export default PersonVirtualCell;
