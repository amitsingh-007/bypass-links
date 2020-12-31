import { makeStyles } from "@material-ui/core";

export const bookmarkWrapperStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root, .MuiFormControl-root": {
      margin: theme.spacing(1),
    },
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
}));
