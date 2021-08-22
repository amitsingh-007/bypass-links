import {
  Box,
  CircularProgress,
  CircularProgressProps,
} from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";

const Loader = memo<{
  loaderSize?: CircularProgressProps["size"];
  disableShrink?: CircularProgressProps["disableShrink"];
  styles?: SxProps;
}>(function Loader({ loaderSize = 55, disableShrink = false, styles = {} }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...styles,
      }}
    >
      <CircularProgress
        style={COLOR.pink}
        size={loaderSize}
        disableShrink={disableShrink}
      />
    </Box>
  );
});
export default Loader;
