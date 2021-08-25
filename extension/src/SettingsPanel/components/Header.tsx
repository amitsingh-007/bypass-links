import { Box, Button } from "@material-ui/core";
import PanelHeading from "GlobalComponents/PanelHeading";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { memo } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useHistory } from "react-router-dom";

const Header = memo(function Header() {
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
        p: "8px",
        ...STICKY_HEADER,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<HiOutlineArrowNarrowLeft />}
        onClick={handleClose}
        size="small"
        color="error"
      >
        Back
      </Button>
      <PanelHeading
        heading="SETTINGS"
        containerStyles={{ marginLeft: "10px" }}
      />
    </Box>
  );
});

export default Header;
