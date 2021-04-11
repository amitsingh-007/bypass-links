import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { memo } from "react";

const Header = memo(
  ({ isFetching, handleClose, handleSave, handleAddRule }) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...STICKY_HEADER,
        }}
      >
        <Box>
          <IconButton
            aria-label="Discard"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Discard and Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label="Save"
            component="span"
            style={COLOR.green}
            onClick={handleSave}
            title="Save and Close"
          >
            <SaveTwoToneIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label="Add"
            component="span"
            style={COLOR.blue}
            onClick={handleAddRule}
            title="Add Rule"
          >
            <PlaylistAddTwoToneIcon fontSize="large" />
          </IconButton>
          {isFetching && (
            <Loader
              loaderSize={30}
              padding="12px"
              display="inline"
              disableShrink
            />
          )}
        </Box>
        <PanelHeading heading="SHORTCUTS PANEL" />
      </Box>
    );
  }
);

export default Header;
