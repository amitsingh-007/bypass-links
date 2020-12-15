import { Box } from "@material-ui/core";
import React from "react";

const Section = ({ children, ...otherprops }) => (
  <Box paddingTop="16px" paddingBottom="16px" {...otherprops}>
    {children}
  </Box>
);

export default Section;
