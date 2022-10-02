import { SvgIconProps } from '@mui/material';

export interface MenuOption {
  onClick: (id: string) => void;
  text: string;
  icon: React.FC<SvgIconProps>;
}

export type IMenuOptions = (MenuOption | MenuOption[])[];
