import { Avatar, AvatarImage, Button } from '@bypass/ui';
import { memo, useContext, useEffect, useState } from 'react';
import DynamicContext from '../../../provider/DynamicContext';
import usePerson from '../hooks/usePerson';
import { type IPerson } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';

interface Props {
  person: IPerson;
}

const Person = memo<Props>(({ person }) => {
  const { location } = useContext(DynamicContext);
  const { uid, name } = person;
  const { resolvePersonImageFromUid } = usePerson();
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    resolvePersonImageFromUid(uid).then((url) => {
      setImageUrl(url);
    });
  }, [uid, person, resolvePersonImageFromUid]);

  const openBookmarksList = () => {
    location.push(getPersonsPanelUrl({ openBookmarksList: uid }));
  };

  return (
    <Button
      variant="secondary"
      data-testid={`person-item-${name}`}
      className="
        size-full flex-col overflow-hidden rounded-xl p-0 whitespace-normal
        transition-opacity
        hover:opacity-80
      "
      onClick={openBookmarksList}
    >
      <Avatar
        className="
          h-[110px] w-full
          after:rounded-none after:border-none
        "
      >
        <AvatarImage src={imageUrl} alt={name} className="rounded-none" />
      </Avatar>
      <div className="flex flex-1 items-center justify-center px-1">
        <span
          className="
            line-clamp-2 w-full text-center text-sm/tight font-bold
            wrap-break-word text-gray-400
          "
          title={name}
        >
          {name}
        </span>
      </div>
    </Button>
  );
});

export default Person;
