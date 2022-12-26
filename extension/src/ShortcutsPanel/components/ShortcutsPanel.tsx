import { IRedirection } from '@/BackgroundScript/interfaces/redirections';
import { syncRedirectionsToStorage } from '@/BackgroundScript/redirect';
import { MAX_PANEL_SIZE } from '@/constants';
import Header from '@bypass/shared/components/Header';
import { FIREBASE_DB_REF } from '@bypass/shared/constants/firebase';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { getRedirections } from '@helpers/fetchFromStorage';
import { saveToFirebase } from '@helpers/firebase/database';
import { Button, Flex, LoadingOverlay } from '@mantine/core';
import useToastStore from '@store/toast';
import { memo, useEffect, useState } from 'react';
import { IoSave } from 'react-icons/io5';
import { RiPlayListAddFill } from 'react-icons/ri';
import { DEFAULT_RULE_ALIAS } from '../constants';
import RedirectionRule from './RedirectionRule';

//Filter valid rules
const getValidRules = (obj: IRedirection) =>
  Boolean(obj && obj.alias && obj.alias !== DEFAULT_RULE_ALIAS && obj.website);

const ShortcutsPanel = memo(function ShortcutsPanel() {
  const displayToast = useToastStore((state) => state.displayToast);
  const [redirections, setRedirections] = useState<IRedirection[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaveActive, setIsSaveActive] = useState(false);

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
      displayToast({
        message: 'Saved succesfully',
        duration: 1500,
      });
    }
    setIsSaveActive(false);
    setIsFetching(false);
  };

  const handleAddRule = () => {
    redirections.unshift({
      alias: DEFAULT_RULE_ALIAS,
      website: '',
      isDefault: false,
    });
    setRedirections([...redirections]);
    setIsSaveActive(true);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    setRedirections(newRedirections);
    setIsSaveActive(true);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
    redirections[pos] = redirection;
    setRedirections([...redirections]);
    setIsSaveActive(true);
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
    <Flex w={MAX_PANEL_SIZE.WIDTH} h={MAX_PANEL_SIZE.HEIGHT} direction="column">
      <DragDropContext onDragEnd={onDragEnd}>
        <Header text="Shortcuts">
          <Button
            variant="light"
            leftIcon={<RiPlayListAddFill />}
            onClick={handleAddRule}
            radius="xl"
            disabled={isFetching}
          >
            Add
          </Button>
          <Button
            variant="light"
            leftIcon={<IoSave />}
            onClick={handleSave}
            color="teal"
            radius="xl"
            loading={isFetching}
            disabled={!isSaveActive}
          >
            Save
          </Button>
        </Header>
        <Droppable droppableId="redirections-list">
          {(provided) => (
            <Flex
              direction="column"
              gap={10}
              p="10px 4px 4px"
              sx={{ overflow: 'auto', flex: 1 }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {redirections.length > 0
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
              <LoadingOverlay visible={isFetching} />
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
    </Flex>
  );
});

export default ShortcutsPanel;
