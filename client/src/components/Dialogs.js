import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import CloseTwoToneIcon from "@material-ui/icons/CloseTwoTone";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
import DoneTwoToneIcon from "@material-ui/icons/DoneTwoTone";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";

export const EditDialog = ({
  children,
  headerText,
  openDialog,
  closeDialog,
  handleSave,
  handleDelete,
  isSaveOptionActive,
}) => {
  return (
    <Dialog fullWidth maxWidth="sm" open={openDialog} onClose={closeDialog}>
      <DialogTitle>{headerText}</DialogTitle>
      <DialogContent
        sx={{
          "& .MuiTextField-root, .MuiFormControl-root": {
            margin: (theme) => theme.spacing(1),
          },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            display: "flex",
            justifyContent: handleDelete ? "space-between" : "flex-end",
            width: "100%",
            paddingX: "7px",
          }}
        >
          {handleDelete ? (
            <IconButton
              component="span"
              style={COLOR.red}
              onClick={handleDelete}
              title="Delete"
            >
              <DeleteTwoToneIcon fontSize="large" />
            </IconButton>
          ) : null}
          <div>
            <IconButton
              component="span"
              style={COLOR.blue}
              onClick={closeDialog}
              title="Cancel"
            >
              <CloseTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              component="span"
              disabled={!isSaveOptionActive}
              style={getActiveDisabledColor(isSaveOptionActive, COLOR.green)}
              onClick={handleSave}
              title="Save"
            >
              <DoneTwoToneIcon fontSize="large" />
            </IconButton>
          </div>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
