import { SvgIconProps } from "@material-ui/core";
import { VoidFunction } from "./custom";

export interface MenuOption {
  onClick: VoidFunction;
  text: string;
  icon: React.FC<SvgIconProps>;
}
