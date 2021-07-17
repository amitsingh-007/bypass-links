import { Box } from "@material-ui/core";
import { displayToast } from "GlobalActionCreators/toast";
import { ROUTES } from "GlobalConstants/routes";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { saveDataToFirebase } from "GlobalHelpers/firebase";
import { syncRedirectionsToStorage } from "SrcPath/BackgroundScript/redirect";
import { memo, useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getRedirections } from "GlobalHelpers/fetchFromStorage";
import { FIREBASE_DB_REF } from "@common/constants/firebase";
import { DEFAULT_RULE_ALIAS } from "../constants";
import Header from "./Header";
import RedirectionRule from "./RedirectionRule";
import { Redirection } from "../interfaces/redirections";

//Filter valid rules
const getValidRules = (obj: Redirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

const ShortcutsPanel = memo(() => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState<Redirection[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getRedirections().then((redirections) => {
      const modifiedRedirections = Object.entries(redirections).map(
        ([_key, { alias, website, isDefault }]) =>
          ({
            alias: atob(alias),
            website: atob(website),
            isDefault,
          } as Redirection)
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
    const shortcutsObj = validRules.reduce<Record<number, Redirection>>(
      (obj, { alias, website, isDefault }, index) => {
        obj[index++] = {
          alias: btoa(alias),
          website: btoa(website),
          isDefault,
        };
        return obj;
      },
      {}
    );
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

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
  };

  const handleSaveRule = (redirection: Redirection, pos: number) => {
    redirections[pos] = redirection;
    setRedirections([...redirections]);
  };

  /*
   * This assumes that we have only one column.
   * Refer: https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
   */
  const onDragEnd = ({ destination, source }: DropResult) => {
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
              {!isFetching && redirections.length > 0
                ? redirections.map(({ alias, website, isDefault }, index) => (
                    <RedirectionRule
                      alias={alias}
                      website={website}
                      isDefault={isDefault}
                      key={`${alias}_${website}`}
                      pos={index}
                      handleRemoveRule={handleRemoveRule}
                      handleSaveRule={handleSaveRule}
                    />
                  ))
                : null}
              {provided.placeholder}
            </form>
          )}
        </Droppable>
      </Box>
    </DragDropContext>
  );
});

export default ShortcutsPanel;
