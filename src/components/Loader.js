import { Box, CircularProgress } from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
import React, { memo } from "react";

const Loader = memo(({ width, loaderSize = 55, ...otherProps }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      width={width}
      style={{ verticalAlign: "middle" }}
      {...otherProps}
    >
      <CircularProgress style={COLOR.pink} size={loaderSize} />
    </Box>
  );
});

export default Loader;
