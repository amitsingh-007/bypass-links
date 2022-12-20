import { Avatar, AvatarGroup, Box } from '@mui/material';
import { CircularTooltip } from '../../StyledComponents';
import { memo, useContext } from 'react';
import { RiUserUnfollowFill } from 'react-icons/ri';
import { IPersonWithImage } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';
import DynamicContext from '../../../provider/DynamicContext';

const AVATAR_SIZE = { SMALL: '23px', BIG: '70px' };
const commonStyles = { marginRight: '12px' };

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(
  function PersonAvatars({ persons }) {
    const { location } = useContext(DynamicContext);

    const hasImages =
      persons?.length && persons.every(({ imageUrl }) => Boolean(imageUrl));

    if (!hasImages) {
      return (
        <Avatar
          sx={{
            width: AVATAR_SIZE.SMALL,
            height: AVATAR_SIZE.SMALL,
            ...commonStyles,
          }}
        >
          <RiUserUnfollowFill style={{ fontSize: '15px' }} />
        </Avatar>
      );
    }

    const handlePersonClick = (person: IPersonWithImage) => {
      location.push(getPersonsPanelUrl({ openBookmarksList: person.uid }));
    };

    return (
      <AvatarGroup sx={commonStyles}>
        {persons.map((person) => (
          <CircularTooltip
            arrow
            key={person.imageUrl}
            title={
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  handlePersonClick(person);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Avatar
                  alt={person.name}
                  src={person.imageUrl}
                  sx={{ width: AVATAR_SIZE.BIG, height: AVATAR_SIZE.BIG }}
                />
              </Box>
            }
          >
            <Avatar
              alt={person.imageUrl}
              src={person.imageUrl}
              sx={{
                width: AVATAR_SIZE.SMALL,
                height: AVATAR_SIZE.SMALL,
                border: 'unset !important',
              }}
            />
          </CircularTooltip>
        ))}
      </AvatarGroup>
    );
  }
);
export default PersonAvatars;
