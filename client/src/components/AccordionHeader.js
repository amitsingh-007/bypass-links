import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@material-ui/core";
import { STICKY_HEADER } from "GlobalConstants/styles";

export const AccordionHeader = ({ children }) => (
  <Accordion sx={{ margin: "0px !important", ...STICKY_HEADER }}>
    {children}
  </Accordion>
);

export const PrimaryHeaderContent = ({ children }) => (
  <AccordionSummary
    sx={{
      padding: "0px",
      minHeight: "50px !important",
      "& .MuiAccordionSummary-content": { margin: "0px !important" },
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {children}
    </Box>
  </AccordionSummary>
);

export const SecondaryHeaderContent = ({ children }) => (
  <AccordionDetails sx={{ paddingTop: "0px" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {children}
    </Box>
  </AccordionDetails>
);
