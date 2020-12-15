import { makeStyles, Typography } from "@material-ui/core";
import React, { memo } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "40px",
    },
  },
}));

const Heading = memo(() => {
  const classes = useStyles();
  return (
    <Typography component="h1" variant="h2" className={classes.root}>
      Welcome to Bypass Links
    </Typography>
  );
});

export default Heading;
