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
}>(({ loaderSize = 55, disableShrink = false, styles = {} }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      verticalAlign: "middle",
      ...styles,
    }}
  >
    <CircularProgress
      style={COLOR.pink}
      size={loaderSize}
      disableShrink={disableShrink}
    />
  </Box>
));
export default Loader;

export const IconButtonLoader = memo(() => (
  <Loader
    loaderSize={28}
    styles={{
      display: "inline-flex",
      width: "59px",
    }}
  />
));
