import { Box, CircularProgress } from "@material-ui/core";
import { COLOR } from "GlobalConstants/color";
import React from "react";

const Loader = ({ width }) => (
  <Box display="flex" justifyContent="center" width={width} marginBottom="12px">
    <CircularProgress style={COLOR.pink} size={55} />
  </Box>
);

export default Loader;
