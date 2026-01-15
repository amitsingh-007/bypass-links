import { Avatar, HoverCard, Tooltip } from '@mantine/core';
import { memo, useContext } from 'react';
import { TbUserOff } from 'react-icons/tb';
import DynamicContext from '../../../provider/DynamicContext';
import { type IPersonWithImage } from '../../Persons/interfaces/persons';
import { getPersonsPanelUrl } from '../../Persons/utils/urls';

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(({ persons }) => {
  const { location } = useContext(DynamicContext);

  return persons.length > 0 ? (
    <Avatar.Group spacing="xs" data-testid="avatar-group">
      {persons.map(({ imageUrl, uid, name }) => (
        <HoverCard
          key={uid}
          withArrow
          returnFocus
          arrowSize={8}
          offset={1}
          shadow="xl"
          radius="xl"
          transitionProps={{
            transition: 'pop',
            duration: 450,
            exitDuration: 0,
          }}
          position="top"
          styles={{ dropdown: { padding: 0, cursor: 'pointer' } }}
        >
          <HoverCard.Target>
            <Avatar
              radius="xl"
              size="1.75rem"
              src={imageUrl}
              data-testid={`avatar-${uid}`}
            />
          </HoverCard.Target>
          <HoverCard.Dropdown data-testid={`person-dropdown-${uid}`}>
            <Tooltip opened label={name} position="right" color="gray">
              <Avatar
                ml={0}
                radius="xl"
                size="4.375rem"
                src={imageUrl}
                alt={name}
                data-testid={`dropdown-avatar-${name}`}
                onClick={() =>
                  location.push(getPersonsPanelUrl({ openBookmarksList: uid }))
                }
              />
            </Tooltip>
          </HoverCard.Dropdown>
        </HoverCard>
      ))}
    </Avatar.Group>
  ) : (
    <Avatar radius="xl" size="1.75rem" color="red">
      <TbUserOff size="1.125rem" />
    </Avatar>
  );
});

export default PersonAvatars;
