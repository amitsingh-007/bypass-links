import { Box, IconButton } from "@material-ui/core";
import ExpandLessRoundedIcon from "@material-ui/icons/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";
import {
  BOOKMARK_PANEL_CONTENT_HEIGHT,
  BOOKMARK_ROW_DIMENTSIONS,
} from "../constants";

const minReqBookmarksToScroll = Math.ceil(
  BOOKMARK_PANEL_CONTENT_HEIGHT / BOOKMARK_ROW_DIMENTSIONS.height
);

interface Props {
  itemsSize: number;
  onScroll: (itemNumber: number) => void;
}

export const ScrollUpButton = memo<Props>(function ScrollUpButton({
  itemsSize,
  onScroll,
}) {
  if (itemsSize <= minReqBookmarksToScroll) {
    return null;
  }

  const handleScrollUpClick = () => {
    onScroll(0);
  };

  const handleScrollDownClick = () => {
    onScroll(itemsSize);
  };

  return (
    <Box
      sx={{ position: "fixed", bottom: "9px", right: "15px", zIndex: 1 }}
      data-amit="singh"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLOR.grey.color,
          borderRadius: "20px",
        }}
      >
        <ButtonContainer onClick={handleScrollUpClick}>
          <ExpandLessRoundedIcon />
        </ButtonContainer>
        <ButtonContainer onClick={handleScrollDownClick}>
          <ExpandMoreRoundedIcon />
        </ButtonContainer>
      </Box>
    </Box>
  );
});

const ButtonContainer: React.FC<{ onClick: any }> = ({ onClick, children }) => (
  <IconButton
    size="small"
    sx={{
      backgroundColor: COLOR.grey.color,
      padding: "1px",
      ":hover": { backgroundColor: COLOR.grey.color },
    }}
    onClick={onClick}
  >
    {children}
  </IconButton>
);
