import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import { STICKY_HEADER } from "GlobalConstants/styles";
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { memo } from "react";

export const AccordionHeader = memo(function AccordionHeader({ children }) {
  const accordionRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const onAccordionStateChange = (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
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

  return children ? (
    <Accordion
      ref={accordionRef}
      expanded={isExpanded}
      onChange={onAccordionStateChange}
      sx={{ margin: "0px !important", ...STICKY_HEADER }}
    >
      {children}
    </Accordion>
  ) : null;
});

export const PrimaryHeaderContent = memo(function PrimaryHeaderContent({
  children,
}) {
  return (
    <AccordionSummary
      sx={{
        padding: "8px 0px",
        minHeight: "unset !important",
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
});

export const SecondaryHeaderContent = memo(function SecondaryHeaderContent({
  children,
}) {
  return (
    <AccordionDetails sx={{ padding: "10px 12px 12px 12px" }}>
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
});
