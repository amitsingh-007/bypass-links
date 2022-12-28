import { Menu } from '@mui/material';
import { menuClasses } from '@mui/material/Menu';
import { styled } from '@mui/material/styles';

export const RightClickMenu = styled(Menu)(() => ({
  [`& .${menuClasses.paper}`]: {
    minWidth: '150px',
    borderRadius: '10px',
  },
}));
