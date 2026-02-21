import { type IPerson, Person } from '@bypass/shared';

interface Props {
  person: IPerson;
}

function PersonVirtualCell({ person }: Props) {
  return (
    <div className="h-full p-1.5">
      <Person person={person} />
    </div>
  );
}

export default PersonVirtualCell;
