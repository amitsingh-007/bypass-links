import { Box } from "@material-ui/core";
import { SxProps } from "@material-ui/system";

export const Row: React.FC<{
  children: React.ReactNode;
  styles?: SxProps;
}> = ({ children, styles = {} }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      my: "3px",
      ...styles,
    }}
  >
    {children}
  </Box>
);
