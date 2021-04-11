import { Box } from "@material-ui/core";

const Section = ({ children, ...styleProps }) => (
  <Box
    sx={{
      paddingTop: "16px",
      paddingBottom: "16px",
      ...styleProps,
    }}
  >
    {children}
  </Box>
);

export default Section;
