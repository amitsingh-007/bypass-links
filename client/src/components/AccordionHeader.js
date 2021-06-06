import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@material-ui/core";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { memo } from "react";

export const AccordionHeader = memo(({ children }) => {
  const accordionRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const onAccordionStateChange = (_event, isExpanded) => {
    setIsExpanded(isExpanded);
  };

  const handleEscapeKeyPress = useCallback(
    (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (isExpanded) {
        setIsExpanded(false);
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [isExpanded]
  );

  useEffect(() => {
    const node = accordionRef?.current;
    node?.addEventListener("keydown", handleEscapeKeyPress);
    return () => {
      node?.removeEventListener("keydown", handleEscapeKeyPress);
    };
  }, [handleEscapeKeyPress]);

  return (
    <Accordion
      ref={accordionRef}
      expanded={isExpanded}
      onChange={onAccordionStateChange}
      sx={{ margin: "0px !important", ...STICKY_HEADER }}
    >
      {children}
    </Accordion>
  );
});

export const PrimaryHeaderContent = memo(({ children }) => (
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
));

export const SecondaryHeaderContent = memo(({ children }) => (
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
));
