import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { Box } from '@mui/material';
import { displayToast } from 'GlobalActionCreators/toast';
import { ROUTES } from 'GlobalConstants/routes';
import { PANEL_DIMENSIONS_PX } from 'GlobalConstants/styles';
import { getRedirections } from 'GlobalHelpers/fetchFromStorage';
import { saveToFirebase } from 'GlobalHelpers/firebase/database';
import { memo, useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@react-forked/dnd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IRedirection } from 'SrcPath/BackgroundScript/interfaces/redirections';
import { syncRedirectionsToStorage } from 'SrcPath/BackgroundScript/redirect';
import { DEFAULT_RULE_ALIAS } from '../constants';
import Header from './Header';
import RedirectionRule from './RedirectionRule';

//Filter valid rules
const getValidRules = (obj: IRedirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

const ShortcutsPanel = memo(function ShortcutsPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [redirections, setRedirections] = useState<IRedirection[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getRedirections().then((redirections) => {
      const modifiedRedirections = Object.entries(redirections).map(
        ([_key, { alias, website, isDefault }]) =>
          ({
            alias: atob(alias),
            website: atob(website),
            isDefault,
          } as IRedirection)
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const handleClose = () => {
    navigate(ROUTES.HOMEPAGE);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = redirections.filter(getValidRules);
    console.log('Saving these redirection rules to Firebase', validRules);
    const shortcutsObj = validRules.reduce<Record<number, IRedirection>>(
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
    const isSaveSuccess = await saveToFirebase(
      FIREBASE_DB_REF.redirections,
      shortcutsObj
    );
    if (isSaveSuccess) {
      syncRedirectionsToStorage();
      setRedirections(validRules);
      dispatch(
        displayToast({
          message: 'Saved succesfully',
          duration: 1500,
        })
      );
    }
    setIsFetching(false);
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: DEFAULT_RULE_ALIAS,
      website: '',
      isDefault: false,
    });
    setRedirections([...redirections]);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
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
      <Box sx={{ width: PANEL_DIMENSIONS_PX.width }}>
        <Header
          isFetching={isFetching}
          handleClose={handleClose}
          handleSave={handleSave}
          handleAddRule={handleAddRule}
        />
        <Droppable droppableId="redirections-list">
          {(provided) => (
            <Box
              sx={{
                paddingLeft: '12px',
                height: PANEL_DIMENSIONS_PX.height,
                overflowY: 'scroll',
              }}
              ref={provided.innerRef as React.Ref<unknown>}
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
            </Box>
          )}
        </Droppable>
      </Box>
    </DragDropContext>
  );
});

export default ShortcutsPanel;
