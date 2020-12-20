import { Box, IconButton } from "@material-ui/core";
import ArrowBackTwoToneIcon from "@material-ui/icons/ArrowBackTwoTone";
import PlaylistAddTwoToneIcon from "@material-ui/icons/PlaylistAddTwoTone";
import SaveTwoToneIcon from "@material-ui/icons/SaveTwoTone";
import { hideEditPanel } from "GlobalActionCreators/index";
import { FIREBASE_DB_REF } from "GlobalConstants/index";
import { COLOR } from "GlobalConstants/color";
import { getFromFirebase, saveDataToFirebase } from "GlobalUtils/firebase";
import { syncFirebaseToStorage } from "GlobalUtils/syncFirebaseToStorage";
import React, { memo, useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import Loader from "./Loader";
import PanelHeading from "./PanelHeading";
import { RedirectionRule } from "./RedirectionRule";

//Filter valid rules
const validRules = (obj) => !!(obj && obj.alias && obj.website);

//Map array into object so as to store in firebase
const reducer = (obj, { alias, website, isDefault }, index) => {
  obj[index++] = {
    alias: btoa(alias),
    website: btoa(website),
    isDefault,
  };
  return obj;
};

export const EditPanel = memo(() => {
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getFromFirebase(FIREBASE_DB_REF.redirections).then((snapshot) => {
      const redirections = snapshot.val();
      const modifiedRedirections = Object.entries(redirections).map(
        ([key, { alias, website, isDefault }]) => ({
          alias: atob(alias),
          website: atob(website),
          isDefault,
        })
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const handleClose = () => {
    dispatch(hideEditPanel());
  };

  const handleSave = async () => {
    console.log("Saving these redirection rules to Firebase", redirections);
    const redirectionsObj = redirections.filter(validRules).reduce(reducer, {});
    const isSaveSuccess = await saveDataToFirebase(
      redirectionsObj,
      FIREBASE_DB_REF.redirections,
      syncFirebaseToStorage
    );
    if (isSaveSuccess) {
      handleClose();
    }
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: "",
      website: "",
      isDefault: false,
    });
    setRedirections([...redirections]);
  };

  const handleRemoveRule = (pos) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
  };

  const handleSaveRule = (alias, website, isDefault, pos) => {
    redirections[pos] = {
      alias,
      website,
      isDefault,
    };
    setRedirections([...redirections]);
  };

  /*
   * This assumes that we have only one column.
   * Refer: https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
   */
  const onDragEnd = ({ destination, source }) => {
    if (!source || !destination || destination.index === source.index) {
      return;
    }
    const newRedirections = Array.from(redirections);
    const draggedRedirection = redirections[source.index];
    newRedirections.splice(source.index, 1);
    newRedirections.splice(destination.index, 0, draggedRedirection);
    setRedirections(newRedirections);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box width="max-content" display="flex" flexDirection="column">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <IconButton
              aria-label="Discard"
              component="span"
              style={COLOR.red}
              onClick={handleClose}
              title="Discard and Close"
            >
              <ArrowBackTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="Save"
              component="span"
              style={COLOR.green}
              onClick={handleSave}
              title="Save and Close"
            >
              <SaveTwoToneIcon fontSize="large" />
            </IconButton>
            <IconButton
              aria-label="Add"
              component="span"
              style={COLOR.blue}
              onClick={handleAddRule}
              title="Add Rule"
            >
              <PlaylistAddTwoToneIcon fontSize="large" />
            </IconButton>
          </Box>
          <PanelHeading heading="REDIRECTION PANEL" />
        </Box>
        {isFetching ? <Loader width="621px" marginBottom="12px" /> : null}
        {!isFetching && redirections && redirections.length > 0 ? (
          <Droppable droppableId="redirections-list">
            {(provided) => (
              <form
                noValidate
                autoComplete="off"
                style={{ paddingLeft: "12px" }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {redirections.map(({ alias, website, isDefault }, index) => (
                  <RedirectionRule
                    alias={alias}
                    website={website}
                    isDefault={isDefault}
                    key={`${alias}_${website}`}
                    pos={index}
                    handleRemoveRule={handleRemoveRule}
                    handleSaveRule={handleSaveRule}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </form>
            )}
          </Droppable>
        ) : null}
      </Box>
    </DragDropContext>
  );
});
