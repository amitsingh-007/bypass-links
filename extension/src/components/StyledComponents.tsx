import { Menu, Switch, Tooltip } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { styled } from "@material-ui/core/styles";

export const BlackTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 11,
    boxShadow: theme.shadows[5],
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

export const StyledSwitch = styled(Switch)(({ theme }) => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&:before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    "&:after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));
