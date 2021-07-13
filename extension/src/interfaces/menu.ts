import { SvgIconProps } from "@material-ui/core";

export interface MenuOption {
  onClick: () => void;
  text: string;
  icon: React.FC<SvgIconProps>;
}
