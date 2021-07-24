import { IShortcut } from "@common/interfaces/shortcuts";
import { Box } from "@material-ui/core";
import { displayToast } from "GlobalActionCreators/toast";
import { ROUTES } from "GlobalConstants/routes";
import { PANEL_DIMENSIONS } from "GlobalConstants/styles";
import { getShortcuts } from "GlobalHelpers/fetchFromStorage";
import { memo, useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { syncShortcutsToStorage } from "SrcPath/BackgroundScript/redirect";
import { saveShortcuts } from "../apis";
import { DEFAULT_RULE_ALIAS } from "../constants";
import { Shortcut } from "../interfaces/shortcuts";
import Header from "./Header";
import ShortcutRule from "./ShortcutRule";

//Filter valid rules
const getValidRules = (obj: Shortcut) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.url);

const ShortcutsPanel = memo(function ShortcutsPanel() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getShortcuts().then((shortcuts) => {
      const sortedShortcuts = shortcuts
        .sort((a, b) => a.priority - b.priority)
        .map<Shortcut>(({ priority, ...shortcut }) => shortcut);
      setShortcuts(sortedShortcuts);
      setIsFetching(false);
    });
  }, []);

  const handleClose = () => {
    history.push(ROUTES.HOMEPAGE);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = shortcuts.filter(getValidRules);
    const mappedShortcuts = validRules.map<IShortcut>((x, index) => ({
      ...x,
      priority: index + 1,
    }));
    const isSaveSuccess = await saveShortcuts(mappedShortcuts);
    await syncShortcutsToStorage();
    if (isSaveSuccess) {
      setShortcuts(validRules);
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
    shortcuts.unshift({
      alias: DEFAULT_RULE_ALIAS,
      url: "",
      isPinned: false,
    });
    setShortcuts([...shortcuts]);
  };

  const handleRemoveRule = (pos: number) => {
    const newShortcuts = [...shortcuts];
    newShortcuts.splice(pos, 1);
    setShortcuts(newShortcuts);
  };

  const handleSaveRule = (shortcut: Shortcut, pos: number) => {
    shortcuts[pos] = shortcut;
    setShortcuts([...shortcuts]);
  };

  /*
   * This assumes that we have only one column.
   * Refer: https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
   */
  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!source || !destination || destination.index === source.index) {
      return;
    }
    const newShortcuts = Array.from(shortcuts);
    const draggedShortcuts = shortcuts[source.index];
    newShortcuts.splice(source.index, 1);
    newShortcuts.splice(destination.index, 0, draggedShortcuts);
    setShortcuts(newShortcuts);
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
        <Droppable droppableId="shortcuts-list">
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
              {!isFetching && shortcuts.length > 0
                ? shortcuts.map(({ alias, url, isPinned }, index) => (
                    <ShortcutRule
                      alias={alias}
                      url={url}
                      isPinned={isPinned}
                      key={`${alias}_${url}`}
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
