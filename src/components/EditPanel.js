import { Box, Button } from "@material-ui/core";
import React from "react";
import CancelIcon from "@material-ui/icons/Cancel";

export const EditPanel = ({ setShowEditPanel }) => {
  const handleClose = () => {
    setShowEditPanel(false);
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<CancelIcon />}
      onClick={handleClose}
    >
      <Box component="span" fontWeight="bold">
        Redirections
      </Box>
    </Button>
  );
};
