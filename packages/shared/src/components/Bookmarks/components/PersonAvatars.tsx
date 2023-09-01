import { Avatar, HoverCard, Tooltip } from '@mantine/core';
import { memo, useContext } from 'react';
import { TbUserOff } from 'react-icons/tb';
import DynamicContext from '../../../provider/DynamicContext';
import { IPersonWithImage } from '../../Persons/interfaces/persons';
import { getPersonsPanelUrl } from '../../Persons/utils/urls';

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(
  function PersonAvatars({ persons }) {
    const { location } = useContext(DynamicContext);

    return persons.length ? (
      <Avatar.Group spacing="xs">
        {persons.map(({ imageUrl, uid, name }) => (
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
            position="top"
            styles={{ dropdown: { padding: 0, cursor: 'pointer' } }}
          >
            <HoverCard.Target>
              <Avatar radius={999} size="1.75rem" src={imageUrl} />
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Tooltip label={name} position="right" color="gray">
                <Avatar
                  ml={0}
                  radius={999}
                  size="4.375rem"
                  src={imageUrl}
                  alt={name}
                  onClick={() =>
                    location.push(
                      getPersonsPanelUrl({ openBookmarksList: uid })
                    )
                  }
                />
              </Tooltip>
            </HoverCard.Dropdown>
          </HoverCard>
        ))}
      </Avatar.Group>
    ) : (
      <Avatar radius={999} size="1.75rem" color="red">
        <TbUserOff size="1.125rem" />
      </Avatar>
    );
  }
);
export default PersonAvatars;
