import { SvgIconProps } from "@material-ui/core";

export interface MenuOptions {
  onClick: () => void;
  text: string;
  icon: React.FC<SvgIconProps>;
}
