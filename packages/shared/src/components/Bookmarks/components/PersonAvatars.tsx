import { Avatar, HoverCard } from '@mantine/core';
import { memo, useContext } from 'react';
import { TbUser } from 'react-icons/tb';
import DynamicContext from '../../../provider/DynamicContext';
import { IPersonWithImage } from '../../Persons/interfaces/persons';
import { getPersonsPanelUrl } from '../../Persons/utils/urls';

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(
  function PersonAvatars({ persons }) {
    const { location } = useContext(DynamicContext);

    return persons.length ? (
      <Avatar.Group spacing="xs">
        {persons.map(({ imageUrl, uid }) => (
          <HoverCard
            key={uid}
            withArrow
            arrowSize={8}
            offset={1}
            shadow="xl"
            radius={999}
            returnFocus
            transitionProps={{
              transition: 'pop',
              duration: 450,
              exitDuration: 0,
            }}
            styles={{
              dropdown: {
                padding: 0,
                cursor: 'pointer',
              },
            }}
          >
            <HoverCard.Target>
              <Avatar radius={999} size="1.75rem" src={imageUrl} />
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Avatar
                ml={0}
                radius={999}
                size="4.375rem"
                src={imageUrl}
                onClick={() =>
                  location.push(getPersonsPanelUrl({ openBookmarksList: uid }))
                }
              />
            </HoverCard.Dropdown>
          </HoverCard>
        ))}
      </Avatar.Group>
    ) : (
      <Avatar radius={999} size="1.75rem" color="red">
        <TbUser size="1.125rem" />
      </Avatar>
    );
  }
);
export default PersonAvatars;
