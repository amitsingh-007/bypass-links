import { Box, Button } from "@material-ui/core";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { VoidFunction } from "GlobalInterfaces/custom";
import { memo } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { IoSave } from "react-icons/io5";
import { RiPlayListAddFill } from "react-icons/ri";

type Props = {
  isFetching: boolean;
  handleClose: VoidFunction;
  handleSave: VoidFunction;
  handleAddRule: VoidFunction;
};

const Header = memo(function Header({
  isFetching,
  handleClose,
  handleSave,
  handleAddRule,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: "8px",
        px: "6px",
        ...STICKY_HEADER,
      }}
    >
      <Box
        sx={{
          "> *": { mr: "12px !important" },
          display: "flex",
          alignItems: "center",
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
        <Button
          variant="outlined"
          startIcon={<RiPlayListAddFill />}
          onClick={handleAddRule}
          size="small"
          color="primary"
        >
          Add
        </Button>
        <Button
          variant="outlined"
          startIcon={<IoSave />}
          onClick={handleSave}
          size="small"
          color="success"
        >
          Save
        </Button>
        {isFetching && <Loader />}
      </Box>
      <PanelHeading heading="SHORTCUTS PANEL" />
    </Box>
  );
});

export default Header;
