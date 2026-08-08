import {
  EBookmarkOperation,
  getBookmarksPanelUrl,
  getEncryptedPerson,
  getFilteredPersons,
  sortByRecency,
  getPersonImageName,
  HEADER_HEIGHT,
  type IPerson,
  type IPersons,
  Persons,
  sortAlphabetically,
  useDefaultFolderUrls,
  usePerson,
  usePersons,
} from '@bypass/shared';
import { Spinner } from '@bypass/ui';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

import { trpcApi } from '@/apis/trpcApi';
import { MAX_PANEL_SIZE } from '@/constants';
import Panel from '@popup/components/Panel';

import { getPersonPos, setPersonsInStorage } from '../utils';
import {
  removePersonImageUrl,
  updatePersonCacheAndImageUrls,
} from '../utils/sync';
import PersonHeader from './PersonHeader';
import PersonVirtualCell from './PersonVirtualCell';

const handleSave = async (persons: IPerson[], uid: string) => {
  const encryptedPersons = persons.reduce<IPersons>((obj, person) => {
    obj[person.uid] = getEncryptedPerson(person);
    return obj;
  }, {});
  await setPersonsInStorage(encryptedPersons, uid);
};

function PersonsPanel() {
  const [, navigate] = useLocation();
  const { getPersonTaggedUrls } = usePerson();
  const [isSaving, setIsSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);

  const { data: persons = [], isLoading } = usePersons();
  const { data: urls = [] } = useDefaultFolderUrls();

  const isFetching = isLoading || isSaving;

  const orderedPersons = orderByRecency
    ? sortByRecency(persons, urls)
    : persons;
  const filteredAndOrderedPersons = getFilteredPersons(
    orderedPersons,
    searchText
  );

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
      await handleSave(sortAlphabetically(newPersons), person.uid);
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
      await handleSave(persons.toSpliced(pos, 1), person.uid);
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
        {isFetching && (
          <div
            data-testid="loading-overlay"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <Spinner className="size-8" />
          </div>
        )}
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            scrollButton
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
            renderPerson={(person) => (
              <PersonVirtualCell
                person={person}
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
