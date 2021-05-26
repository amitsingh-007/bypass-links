import { Avatar, AvatarGroup, Box } from "@material-ui/core";
import PersonOffIcon from "@material-ui/icons/PersonOff";
import { CircularTooltip } from "GlobalComponents/StyledComponents";
import { memo } from "react";
import { useHistory } from "react-router";
import { getTaggingPanelUrl } from "SrcPath/TaggingPanel/utils";

const AVATAR_SIZE = { SMALL: "23px", BIG: "70px" };
const commonStyles = { marginRight: "8px" };

const PersonAvatars = memo(({ persons }) => {
  const history = useHistory();

  const hasImages = persons?.length && persons.every(({ url }) => Boolean(url));

  if (!hasImages) {
    return (
      <Avatar
        sx={{
          width: AVATAR_SIZE.SMALL,
          height: AVATAR_SIZE.SMALL,
          ...commonStyles,
        }}
      >
        <PersonOffIcon sx={{ fontSize: 17 }} />
      </Avatar>
    );
  }

  const handlePersonClick = (person) => {
    history.push(getTaggingPanelUrl({ openBookmarksList: person.uid }));
  };

  return (
    <AvatarGroup sx={commonStyles}>
      {persons.map((person) => (
        <CircularTooltip
          arrow
          key={person.imageUrl}
          title={
            <Box
              onClick={() => {
                handlePersonClick(person);
              }}
              sx={{ cursor: "pointer" }}
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
              border: "unset !important",
            }}
          />
        </CircularTooltip>
      ))}
    </AvatarGroup>
  );
});
export default PersonAvatars;
