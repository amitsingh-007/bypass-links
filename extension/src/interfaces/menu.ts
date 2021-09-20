import { SvgIconProps } from "@mui/material";
import { VoidFunction } from "./custom";

export interface MenuOption {
  onClick: VoidFunction;
  text: string;
  icon: React.FC<SvgIconProps>;
}
