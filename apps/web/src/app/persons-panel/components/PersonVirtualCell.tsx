import { type IPerson, Person } from '@bypass/shared';

interface Props {
  person: IPerson;
  imageUrl?: string;
}

function PersonVirtualCell({ person, imageUrl }: Props) {
  return (
    <div className="h-full p-1.5">
      <Person person={person} imageUrl={imageUrl} />
    </div>
  );
}

export default PersonVirtualCell;
