import { Box, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { displayToast } from "GlobalActionCreators/toast";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import Search from "GlobalComponents/Search";
import { memo, useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { IoIosPersonAdd } from "react-icons/io";
import { RiUploadCloud2Fill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IPerson } from "../interfaces/persons";
import { syncPersonsFirebaseWithStorage } from "../utils/sync";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import Sort from "./Sort";

interface Props {
  isFetching: boolean;
  handleAddPerson: any;
  persons: IPerson[];
  handleSort: any;
  onSearchChange: (text: string) => void;
}

const Header = memo<Props>(function Header({
  isFetching,
  handleAddPerson,
  persons,
  handleSort,
  onSearchChange,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

  const toggleAddPersonDialog = () => {
    setShowAddPersonDialog(!showAddPersonDialog);
  };

  const handleAddPersonClick: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation();
    toggleAddPersonDialog();
  };

  const handlePersonSave = (person: IPerson) => {
    handleAddPerson(person);
    toggleAddPersonDialog();
  };

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    navigate(-1);
  };

  const onSyncClick: React.MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.stopPropagation();
    if (isSyncing) {
      return;
    }
    setIsSyncing(true);
    try {
      await syncPersonsFirebaseWithStorage();
      dispatch(displayToast({ message: "Persons synced succesfully" }));
    } catch (ex) {
      console.error("Persons synced failed", ex);
      dispatch(
        displayToast({ message: "Persons synced failed", severity: "error" })
      );
    }
    setIsSyncing(false);
  };

  return (
    <>
      <AccordionHeader>
        <PrimaryHeaderContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: "8px",
              "> *": { mr: "12px !important" },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<HiOutlineArrowNarrowLeft />}
              onClick={handleClose}
              size="small"
              color="error"
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<IoIosPersonAdd />}
              onClick={handleAddPersonClick}
              size="small"
              color="primary"
            >
              Add
            </Button>
            <LoadingButton
              variant="outlined"
              startIcon={<RiUploadCloud2Fill />}
              onClick={onSyncClick}
              size="small"
              color="warning"
              loading={isSyncing}
            >
              Sync
            </LoadingButton>
            {isFetching && <Loader />}
          </Box>
          <PanelHeading
            heading={`PERSONS PANEL (${persons?.length || 0})`}
            containerStyles={{ marginLeft: "10px" }}
          />
        </PrimaryHeaderContent>
        <SecondaryHeaderContent>
          <Box sx={{ minWidth: "150px" }}>
            <Sort onChange={handleSort} />
          </Box>
          <Search onChange={onSearchChange} />
        </SecondaryHeaderContent>
      </AccordionHeader>
      {showAddPersonDialog && (
        <AddOrEditPersonDialog
          isOpen={showAddPersonDialog}
          onClose={toggleAddPersonDialog}
          handleSaveClick={handlePersonSave}
        />
      )}
    </>
  );
});

export default Header;
