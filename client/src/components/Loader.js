import { Box, CircularProgress } from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";

const Loader = memo(({ loaderSize = 55, ...styleProps }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      verticalAlign: "middle",
      ...styleProps,
    }}
  >
    <CircularProgress style={COLOR.pink} size={loaderSize} disableShrink />
  </Box>
));
export default Loader;

export const IconButtonLoader = memo(() => (
  <Loader width="59px" loaderSize={28} display="inline-flex" />
));
