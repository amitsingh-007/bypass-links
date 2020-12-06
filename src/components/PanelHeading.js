import { Typography } from "@material-ui/core";
import red from "@material-ui/core/colors/red";
import React from "react";

const titleStyles = {
  fontSize: "21px",
  marginRight: "18px",
  fontWeight: "700",
  color: red[300],
};

const PanelHeading = ({ heading }) => (
  <Typography
    component="span"
    variant="h1"
    display="inline"
    style={titleStyles}
  >
    {heading}
  </Typography>
);

export default PanelHeading;
