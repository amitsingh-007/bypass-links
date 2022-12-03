import { useMediaQuery, useTheme } from '@mui/material';

const useDevice = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  return isDesktop;
};

export default useDevice;
