import { Box, IconButton } from "@material-ui/core";
import { alpha } from "@material-ui/core/styles";
import { memo } from "react";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";

interface Props {
  itemsSize: number;
  onScroll: (itemNumber: number) => void;
  minItemsReqToShow?: number;
}

export const ScrollButton = memo<Props>(function ScrollButton({
  itemsSize,
  onScroll,
  minItemsReqToShow: minItemsToScroll = 0,
}) {
  if (minItemsToScroll > 0 && itemsSize <= minItemsToScroll) {
    return null;
  }

  const handleScrollUpClick = () => {
    onScroll(0);
  };

  const handleScrollDownClick = () => {
    onScroll(itemsSize);
  };

  return (
    <Box sx={{ position: "fixed", bottom: "9px", right: "15px", zIndex: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: (theme) => theme.palette.grey[800],
          borderRadius: "20px",
        }}
      >
        <ButtonContainer onClick={handleScrollUpClick}>
          <BsFillCaretUpFill />
        </ButtonContainer>
        <ButtonContainer onClick={handleScrollDownClick}>
          <BsFillCaretDownFill />
        </ButtonContainer>
      </Box>
    </Box>
  );
});

const ButtonContainer: React.FC<{ onClick: any }> = ({ onClick, children }) => (
  <IconButton
    sx={{
      backgroundColor: (theme) => theme.palette.grey[800],
      padding: "1px",
      "&:hover": {
        backgroundColor: (theme) => alpha(theme.palette.grey[100], 0.25),
      },
      fontSize: "20px",
    }}
    onClick={onClick}
  >
    {children}
  </IconButton>
);
