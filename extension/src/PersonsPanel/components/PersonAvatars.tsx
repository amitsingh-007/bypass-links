import { Avatar, AvatarGroup, Box } from '@mui/material';
import { CircularTooltip } from 'GlobalComponents/StyledComponents';
import { memo } from 'react';
import { RiUserUnfollowFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { IPersonWithImage } from '../interfaces/persons';
import { getPersonsPanelUrl } from '../utils/urls';

const AVATAR_SIZE = { SMALL: '23px', BIG: '70px' };
const commonStyles = { marginRight: '12px' };

const PersonAvatars = memo<{ persons: IPersonWithImage[] }>(
  function PersonAvatars({ persons }) {
    const navigate = useNavigate();

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
      navigate(getPersonsPanelUrl({ openBookmarksList: person.uid }));
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
