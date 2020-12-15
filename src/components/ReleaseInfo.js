import { Box, Typography } from "@material-ui/core";
import React, { memo } from "react";

const infoStyles = {
  fontSize: "16px",
  paddingLeft: "4px",
  paddingRight: "4px",
};

const Info = ({ info }) => (
  <Typography
    component="span"
    variant="h6"
    style={infoStyles}
    className="customBgColor"
  >{`Last Update: ${info}`}</Typography>
);

export const ReleaseInfo = memo(() => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-end"
      height="100px"
    >
      <Info info={__RELEASE_DATE__} />
      <Info info={__EXT_VERSION__} />
    </Box>
  );
});
