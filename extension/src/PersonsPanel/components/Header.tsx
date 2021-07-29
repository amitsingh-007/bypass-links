import { IPerson } from "@common/interfaces/person";
import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PersonAddTwoToneIcon from "@material-ui/icons/PersonAddTwoTone";
import {
  AccordionHeader,
  PrimaryHeaderContent,
  SecondaryHeaderContent,
} from "GlobalComponents/AccordionHeader";
import Loader from "GlobalComponents/Loader";
import PanelHeading from "GlobalComponents/PanelHeading";
import SearchInput from "GlobalComponents/SearchInput";
import { COLOR } from "GlobalConstants/color";
import { memo, useState } from "react";
import { useHistory } from "react-router";
import AddOrEditPersonDialog from "./AddOrEditPersonDialog";
import Sort from "./Sort";

interface Props {
  isFetching: boolean;
  handleAddPerson: any;
  persons: IPerson[];
  handleSort: any;
}

const Header = memo<Props>(function Header({
  isFetching,
  handleAddPerson,
  persons,
  handleSort,
}) {
  const history = useHistory();
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
    history.goBack();
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
              onClick={handleAddPersonClick}
              title="Add Person"
            >
              <PersonAddTwoToneIcon fontSize="large" />
            </IconButton>
            {isFetching && (
              <Loader
                loaderSize={28}
                disableShrink
                styles={{
                  padding: "3px",
                  display: "inline",
                }}
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
