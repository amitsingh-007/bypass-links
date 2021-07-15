import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { VoidFunction } from "GlobalInterfaces/custom";
import { memo } from "react";

type Props = {
  isFetching: boolean;
  handleClose: VoidFunction;
  handleSave: VoidFunction;
  handleAddRule: VoidFunction;
};

const Header = memo(
  ({ isFetching, handleClose, handleSave, handleAddRule }: Props) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: "4px",
          px: "6px",
          ...STICKY_HEADER,
        }}
      >
        <Box sx={{ "> *": { mr: "12px !important" } }}>
          <IconButton
            size="small"
            aria-label="Discard"
            component="span"
            style={COLOR.red}
            onClick={handleClose}
            title="Discard and Close"
          >
            <ArrowBackTwoToneIcon fontSize="large" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Save"
            component="span"
            style={COLOR.green}
            onClick={handleSave}
            title="Save and Close"
          >
            <SaveTwoToneIcon fontSize="large" />
          </IconButton>
          <IconButton
            size="small"
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
              loaderSize={28}
              disableShrink
              styles={{
                padding: "3px",
                display: "inline",
              }}
            />
          )}
        </Box>
        <PanelHeading heading="SHORTCUTS PANEL" />
      </Box>
    );
  }
);

export default Header;
