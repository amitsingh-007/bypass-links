import { Box } from "@material-ui/core";

export const Row = ({ children, styles = {} }) => (
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
