import { SxProps } from "@material-ui/system";
import { BG_COLOR_DARK } from "./color";

export const PANEL_DIMENSIONS = {
  width: "792px",
  height: "540px",
};

export const STICKY_HEADER = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: BG_COLOR_DARK,
} as SxProps;
