import { Box } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { Theme } from "@material-ui/core/styles";

export const Row = ({
  children,
  styles = {},
}: {
  children: React.ReactNode;
  styles?: SxProps<Theme>;
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
