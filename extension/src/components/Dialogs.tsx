import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { VoidFunction } from "GlobalInterfaces/custom";
import { MdClose, MdDone } from "react-icons/md";
import { RiBookmark2Fill } from "react-icons/ri";

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
        <DialogActions sx={{ pt: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: handleDelete ? "space-between" : "flex-end",
              width: "100%",
              px: "24px",
              pb: "10px",
            }}
          >
            {handleDelete ? (
              <Button
                variant="outlined"
                startIcon={<RiBookmark2Fill />}
                onClick={handleDelete}
                size="small"
                color="error"
              >
                Delete
              </Button>
            ) : null}
            <Box>
              <Button
                variant="outlined"
                startIcon={<MdClose />}
                onClick={closeDialog}
                size="small"
                color="error"
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="outlined"
                startIcon={<MdDone />}
                size="small"
                disabled={!isSaveOptionActive}
                color="success"
                sx={{ ml: "10px" }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
