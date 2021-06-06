import { Menu, Tooltip } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";

export const BlackTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 11,
  },
  arrow: {
    color: theme.palette.common.black,
  },
}))(Tooltip);

export const CircularTooltip = withStyles(() => ({
  tooltip: {
    borderRadius: "50%",
    padding: "4px",
  },
}))(BlackTooltip);

export const RightClickMenu = withStyles(() => ({
  paper: {
    minWidth: "150px",
    borderRadius: "10px",
  },
}))(Menu);
