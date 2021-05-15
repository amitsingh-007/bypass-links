import { IconButton } from "@material-ui/core";
import ExpandMoreRoundedIcon from "@material-ui/icons/ExpandMoreRounded";
import { COLOR } from "GlobalConstants/color";

const ScrollButton = () => {
  const handleScrollClick = () => {
    window.scrollTo({ bottom: 0, behavior: "smooth" });
  };

  return (
    <IconButton
      sx={{
        position: "fixed",
        top: "65px",
        right: "5px",
        backgroundColor: COLOR.grey.color,
      }}
      size="small"
      onClick={handleScrollClick}
    >
      <ExpandMoreRoundedIcon />
    </IconButton>
  );
};

export default ScrollButton;
