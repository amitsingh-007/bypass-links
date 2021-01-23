import { Menu, Tooltip, withStyles } from "@material-ui/core";

export const BlackTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 11,
  },
  arrow: {
    color: theme.palette.common.black,
  },
}))(Tooltip);

export const BlackMenu = withStyles(() => ({
  paper: {
    backgroundColor: "#181a1b",
  },
}))(Menu);
