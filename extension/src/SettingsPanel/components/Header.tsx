import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { memo } from "react";
import { useHistory } from "react-router";

const Header = memo(() => {
  const history = useHistory();

  const handleClose = () => {
    history.goBack();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: "4px",
        ...STICKY_HEADER,
      }}
    >
      <IconButton
        size="small"
        aria-label="Close"
        component="span"
        style={COLOR.red}
        onClick={handleClose}
        title="Close"
      >
        <ArrowBackTwoToneIcon fontSize="large" />
      </IconButton>
      <PanelHeading
        heading="SETTINGS"
        containerStyles={{ marginLeft: "10px" }}
      />
    </Box>
  );
});

export default Header;
