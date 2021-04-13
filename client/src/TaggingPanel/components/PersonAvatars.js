import { Avatar, AvatarGroup } from "@material-ui/core";
import { CircularTooltip } from "GlobalComponents/StyledComponents";
import { memo } from "react";

const AVATAR_SIZE = { SMALL: "23px", BIG: "70px" };
const commonStyles = { marginRight: "8px" };

const PersonAvatars = memo(({ imageUrls }) =>
  imageUrls?.length ? (
    <AvatarGroup sx={commonStyles}>
      {imageUrls.map((imageUrl) => (
        <CircularTooltip
          key={imageUrl}
          title={
            <Avatar
              alt={imageUrl}
              src={imageUrl}
              sx={{
                width: AVATAR_SIZE.BIG,
                height: AVATAR_SIZE.BIG,
              }}
            />
          }
          arrow
          disableInteractive
        >
          <Avatar
            alt={imageUrl}
            src={imageUrl}
            sx={{
              width: AVATAR_SIZE.SMALL,
              height: AVATAR_SIZE.SMALL,
              border: "unset !important",
            }}
          />
        </CircularTooltip>
      ))}
    </AvatarGroup>
  ) : (
    <Avatar
      sx={{
        width: AVATAR_SIZE.SMALL,
        height: AVATAR_SIZE.SMALL,
        ...commonStyles,
      }}
    />
  )
);
export default PersonAvatars;
