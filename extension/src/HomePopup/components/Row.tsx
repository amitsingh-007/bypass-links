import { Box } from '@mui/material';
import { SxProps } from '@mui/system';

export const Row: React.FC<{
  children: React.ReactNode;
  styles?: SxProps;
}> = ({ children, styles = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      my: '6px',
      ...styles,
    }}
  >
    {children}
  </Box>
);
