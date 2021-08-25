import { Box, CircularProgress } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { memo } from "react";

const Loader = memo<{ styles?: SxProps }>(function Loader({ styles = {} }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...styles,
      }}
    >
      <CircularProgress color="info" size={28} disableShrink />
    </Box>
  );
});
export default Loader;
