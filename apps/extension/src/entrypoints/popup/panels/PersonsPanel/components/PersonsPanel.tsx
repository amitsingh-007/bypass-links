import {
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getEncryptedPerson,
  getPersonImageName,
  HEADER_HEIGHT,
  type IPerson,
  type IPersons,
  Persons,
  sortAlphabetically,
  useOrderedPersons,
  usePerson,
  usePersons,
} from '@bypass/shared';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocation, useSearch } from 'wouter';

import { trpcApi } from '@/apis/trpcApi';
import { MAX_PANEL_SIZE } from '@/constants';
import LoadingOverlay from '@popup/components/LoadingOverlay';
import Panel from '@popup/components/Panel';

import { getPersonPos, setPersonsInStorage } from '../utils';
import {
  removePersonImageUrl,
  updatePersonCacheAndImageUrls,
} from '../utils/sync';
import PersonHeader from './PersonHeader';
import PersonVirtualCell from './PersonVirtualCell';

const handleSave = async (persons: IPerson[]) => {
  const encryptedPersons = persons.reduce<IPersons>((obj, person) => {
    obj[person.uid] = getEncryptedPerson(person);
    return obj;
  }, {});
  await setPersonsInStorage(encryptedPersons);
};

function PersonsPanel() {
  const [, navigate] = useLocation();
  const queryString = useSearch();
  const { getPersonTaggedUrls } = usePerson();
  const [isSaving, setIsSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);

  const { data: persons = [] } = usePersons();
  const { data: filteredAndOrderedPersons, isLoading } = useOrderedPersons(
    orderByRecency,
    searchText
  );

  const isFetching = isLoading || isSaving;

  const runSave = async (errorMessage: string, save: () => Promise<void>) => {
    setIsSaving(true);
    try {
      await save();
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOrEditPerson = async (person: IPerson) => {
    const pos = getPersonPos(persons, person);
    const isNewPerson = pos === -1;
    const newPersons = isNewPerson
      ? [...persons, person]
      : persons.with(pos, person);

    await runSave(`Could not save ${person.name}`, async () => {
      await updatePersonCacheAndImageUrls(person);
      await handleSave(sortAlphabetically(newPersons));
      toast.success(
        `${person.name} ${isNewPerson ? 'added' : 'updated'} successfully`
      );
    });
  };

  const handlePersonDelete = async (person: IPerson) => {
    const pos = getPersonPos(persons, person);
    // Without this, toSpliced(-1, 1) would drop the last person instead
    if (pos === -1) {
      return;
    }
    const taggedUrls = await getPersonTaggedUrls(person.uid);
    if (taggedUrls.length > 0) {
      toast.error('Cannot delete a person with tagged bookmarks');
      return;
    }

    await runSave(`Could not delete ${person.name}`, async () => {
      await trpcApi.storage.removeFile.mutate(getPersonImageName(person.uid));
      await removePersonImageUrl(person.uid);
      await handleSave(persons.toSpliced(pos, 1));
      toast.success('Person deleted successfully');
    });
  };

  const toggleOrderByRecency = () => setOrderByRecency((prev) => !prev);

  return (
    <Panel>
      <PersonHeader
        isFetching={isFetching}
        handleAddPerson={handleAddOrEditPerson}
        persons={filteredAndOrderedPersons}
        orderByRecency={orderByRecency}
        toggleOrderByRecency={toggleOrderByRecency}
        onSearchChange={setSearchText}
      />
      <div
        className="relative"
        style={{ height: MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT }}
      >
        {isFetching && <LoadingOverlay />}
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            scrollButton
            queryString={queryString}
            persons={filteredAndOrderedPersons}
            bookmarkListProps={{
              fullscreen: true,
              onBookmarkEdit: ({ url, parentId }) => {
                navigate(
                  getBookmarksPanelUrl({
                    operation: EBookmarkOperation.EDIT,
                    bmUrl: url,
                    folderId: parentId,
                  })
                );
              },
            }}
            renderPerson={(person, imageUrl) => (
              <PersonVirtualCell
                person={person}
                imageUrl={imageUrl}
                handleEditPerson={handleAddOrEditPerson}
                handlePersonDelete={handlePersonDelete}
              />
            )}
          />
        ) : null}
      </div>
    </Panel>
  );
}

export default PersonsPanel;
