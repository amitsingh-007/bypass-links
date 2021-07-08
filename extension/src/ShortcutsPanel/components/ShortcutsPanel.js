import { FIREBASE_DB_REF } from "../../../../common/src/constants/firebase";
import { Box } from "@material-ui/core";
import storage from "ChromeApi/storage";
import { displayToast } from "GlobalActionCreators/toast";
import { STORAGE_KEYS } from "GlobalConstants";
import { ROUTES } from "GlobalConstants/routes";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { saveDataToFirebase } from "GlobalUtils/firebase";
import { syncRedirectionsToStorage } from "GlobalUtils/redirect";
import { memo, useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { DEFAULT_RULE_ALIAS } from "../constants";
import Header from "./Header";
import RedirectionRule from "./RedirectionRule";

//Filter valid rules
const getValidRules = (obj) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

//Map array into object so as to store in firebase
const reducer = (obj, { alias, website, isDefault }, index) => {
  obj[index++] = {
    alias: btoa(alias),
    website: btoa(website),
    isDefault,
  };
  return obj;
};

const ShortcutsPanel = memo(() => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    storage
      .get([STORAGE_KEYS.redirections])
      .then(({ [STORAGE_KEYS.redirections]: redirections }) => {
        const modifiedRedirections = Object.entries(redirections).map(
          ([_key, { alias, website, isDefault }]) => ({
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
    history.push(ROUTES.HOMEPAGE);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = redirections.filter(getValidRules);
    console.log("Saving these redirection rules to Firebase", validRules);
    const shortcutsObj = validRules.reduce(reducer, {});
    const isSaveSuccess = await saveDataToFirebase(
      shortcutsObj,
      FIREBASE_DB_REF.redirections,
      syncRedirectionsToStorage
    );
    if (isSaveSuccess) {
      setRedirections(validRules);
      dispatch(
        displayToast({
          message: "Saved succesfully",
          duration: 1500,
        })
      );
    }
    setIsFetching(false);
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: DEFAULT_RULE_ALIAS,
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
      <Box sx={{ width: PANEL_DIMENSIONS.width }}>
        <Header
          isFetching={isFetching}
          handleClose={handleClose}
          handleSave={handleSave}
          handleAddRule={handleAddRule}
        />
        {
          <Droppable droppableId="redirections-list">
            {(provided) => (
              <form
                noValidate
                autoComplete="off"
                style={{
                  paddingLeft: "12px",
                  minHeight: PANEL_DIMENSIONS.height,
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {!isFetching && redirections && redirections.length > 0
                  ? redirections.map(({ alias, website, isDefault }, index) => (
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
                    ))
                  : null}
                {provided.placeholder}
              </form>
            )}
          </Droppable>
        }
      </Box>
    </DragDropContext>
  );
});

export default ShortcutsPanel;
