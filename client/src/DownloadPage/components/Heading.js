import { Typography } from "@material-ui/core";
import { memo } from "react";

const Heading = memo(() => {
  return (
    <Typography
      component="h1"
      variant="h2"
      sx={{ fontSize: ["40px", null, "60px"] }}
    >
      Welcome to Bypass Links
    </Typography>
  );
});

export default Heading;
