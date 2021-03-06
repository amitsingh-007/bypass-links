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
import { VoidFunction } from "GlobalInterfaces/custom";
import { getActiveDisabledColor } from "GlobalUtils/color";

interface Props {
  headerText: string;
  openDialog: boolean;
  closeDialog: VoidFunction;
  handleSave: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete?: VoidFunction;
  isSaveOptionActive: boolean;
}

export const EditDialog: React.FC<Props> = ({
  children,
  headerText,
  openDialog,
  closeDialog,
  handleSave,
  handleDelete,
  isSaveOptionActive,
}) => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //Stop conflict with enter click on panels
    e.stopPropagation();
    e.preventDefault();
    handleSave(e);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={openDialog} onClose={closeDialog}>
      <Box component="form" onSubmit={onSubmit}>
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
                type="button"
                component="button"
                style={COLOR.red}
                onClick={handleDelete}
                title="Delete"
              >
                <DeleteTwoToneIcon fontSize="large" />
              </IconButton>
            ) : null}
            <div>
              <IconButton
                type="button"
                component="button"
                style={COLOR.blue}
                onClick={closeDialog}
                title="Cancel"
              >
                <CloseTwoToneIcon fontSize="large" />
              </IconButton>
              <IconButton
                type="submit"
                component="button"
                disabled={!isSaveOptionActive}
                style={getActiveDisabledColor(isSaveOptionActive, COLOR.green)}
                title="Save"
              >
                <DoneTwoToneIcon fontSize="large" />
              </IconButton>
            </div>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
