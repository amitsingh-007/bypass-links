import { Box } from "@material-ui/core";
import { SxProps } from "@material-ui/system";

export const Row = ({
  children,
  styles = {},
}: {
  children: React.ReactNode;
  styles?: SxProps;
}) => (
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
