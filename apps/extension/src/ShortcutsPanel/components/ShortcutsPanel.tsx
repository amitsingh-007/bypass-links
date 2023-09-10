import { IRedirection } from '@/BackgroundScript/interfaces/redirections';
import { syncRedirectionsToStorage } from '@/BackgroundScript/redirect';
import { MAX_PANEL_SIZE } from '@/constants';
import { FIREBASE_DB_REF, Header } from '@bypass/shared';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getRedirections } from '@helpers/fetchFromStorage';
import { saveToFirebase } from '@helpers/firebase/database';
import { Button, Flex, LoadingOverlay } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import useToastStore from '@store/toast';
import { memo, useEffect, useState } from 'react';
import { IoSave } from 'react-icons/io5';
import { RiPlayListAddFill } from 'react-icons/ri';
import { DEFAULT_RULE_ALIAS } from '../constants';
import useShortcutDrag from '../hooks/useShortcutDrag';
import { getRedirectionId, getValidRules } from '../utils';
import DragClone from './DragClone';
import DragRedirection from './DragRedirection';

const ShortcutsPanel = memo(function ShortcutsPanel() {
  const displayToast = useToastStore((state) => state.displayToast);
  const [redirections, setRedirections] = useState<IRedirection[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaveActive, setIsSaveActive] = useState(false);
  const { ref, width } = useElementSize();

  useEffect(() => {
    getRedirections().then((_redirections) => {
      const modifiedRedirections = Object.entries(_redirections).map(
        ([_key, { alias, website, isDefault }]) =>
          ({
            alias: atob(alias),
            website: atob(website),
            isDefault,
          }) satisfies IRedirection
      );
      setRedirections(modifiedRedirections);
      setIsFetching(false);
    });
  }, []);

  const saveRedirectionTemp = (newRedirections: IRedirection[]) => {
    setRedirections(newRedirections);
    setIsSaveActive(true);
  };

  const handleSave = async () => {
    setIsFetching(true);
    const validRules = redirections.filter(getValidRules);
    console.log('Saving these redirection rules to Firebase', validRules);
    const shortcutsObj = validRules.reduce<Record<number, IRedirection>>(
      (obj, { alias, website, isDefault }, index) => {
        obj[index] = {
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
        message: 'Saved successfully',
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
    saveRedirectionTemp([...redirections]);
  };

  const handleRemoveRule = (pos: number) => {
    const newRedirections = [...redirections];
    newRedirections.splice(pos, 1);
    saveRedirectionTemp(newRedirections);
  };

  const handleSaveRule = (redirection: IRedirection, pos: number) => {
    redirections[pos] = redirection;
    saveRedirectionTemp([...redirections]);
  };

  const { sensors, draggingNode, onDragStart, onDragEnd, onDragCancel } =
    useShortcutDrag({
      redirections,
      saveRedirectionTemp,
    });

  return (
    <Flex w={MAX_PANEL_SIZE.WIDTH} h={MAX_PANEL_SIZE.HEIGHT} direction="column">
      <Header text="Shortcuts">
        <Button
          leftIcon={<RiPlayListAddFill />}
          onClick={handleAddRule}
          radius="xl"
          disabled={isFetching}
        >
          Add
        </Button>
        <Button
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext
          items={redirections.map(getRedirectionId)}
          strategy={verticalListSortingStrategy}
        >
          <Flex
            ref={ref}
            direction="column"
            gap={10}
            p="0.625rem 0.25rem 0.25rem"
            sx={{ overflow: 'auto', flex: 1 }}
          >
            {redirections?.map((redirection, index) => (
              <DragRedirection
                key={getRedirectionId(redirection)}
                redirection={redirection}
                pos={index}
                handleRemoveRule={handleRemoveRule}
                handleSaveRule={handleSaveRule}
              />
            ))}
            <LoadingOverlay visible={isFetching} />
          </Flex>
        </SortableContext>
        <DragOverlay style={{ width }}>
          {!!draggingNode && (
            <DragClone
              redirections={redirections}
              draggingNode={draggingNode}
            />
          )}
        </DragOverlay>
      </DndContext>
    </Flex>
  );
});

export default ShortcutsPanel;
