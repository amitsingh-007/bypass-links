import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PersonAddTwoToneIcon from "@material-ui/icons/PersonAddTwoTone";
import SyncTwoToneIcon from "@material-ui/icons/SyncTwoTone";
import { displayToast } from "GlobalActionCreators";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import { COLOR } from "GlobalConstants/color";
import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import SearchInput from "SrcPath/BookmarksPanel/components/SearchInput";
import { syncPersonsFirebaseWithStorage } from "../utils/sync";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import Sort from "./Sort";

const Header = memo(({ isFetching, handleAddPerson, persons, handleSort }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);

  const toggleAddPersonDialog = (event) => {
    event && event.stopPropagation();
    setShowAddPersonDialog(!showAddPersonDialog);
  };

  const handlePersonSave = (person) => {
    handleAddPerson(person);
    toggleAddPersonDialog();
  };

  const handleClose = (event) => {
    event.stopPropagation();
    history.goBack();
  };

  const onSyncClick = async (event) => {
    event.stopPropagation();
    if (isSyncing) {
      return;
    }
    setIsSyncing(true);
    try {
      await syncPersonsFirebaseWithStorage();
      dispatch(displayToast({ message: "Persons synced succesfully" }));
    } catch (ex) {
      dispatch(displayToast({ message: ex, severity: "error" }));
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
            <IconButton
              size="small"
              aria-label="Discard"
              component="span"
              style={COLOR.red}
              onClick={handleClose}
              title="Discard and Close"
            >
              <ArrowBackTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Add"
              component="span"
              style={COLOR.blue}
              onClick={toggleAddPersonDialog}
              title="Add Person"
            >
              <PersonAddTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Sync"
              component="span"
              onClick={onSyncClick}
              title="Sync storage to firebase"
              disabled={isSyncing}
            >
              <SyncTwoToneIcon
                fontSize="large"
                className={isSyncing ? "iconLoading" : null}
                htmlColor={COLOR.orange.color}
              />
            </IconButton>
            {isFetching && (
              <Loader
                loaderSize={28}
                padding="3px"
                display="inline"
                disableShrink
              />
            )}
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
          <SearchInput searchClassName="personContainer" />
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
