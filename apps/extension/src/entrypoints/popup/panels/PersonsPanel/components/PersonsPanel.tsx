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
  useBookmark,
  usePerson,
} from '@bypass/shared';
import { Spinner } from '@bypass/ui';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useLocation } from 'wouter';

import { trpcApi } from '@/apis/trpcApi';
import { MAX_PANEL_SIZE } from '@/constants';
import Panel from '@popup/components/Panel';

import {
  getAllDecodedPersons,
  getPersonPos,
  setPersonsInStorage,
} from '../utils';
import { updatePersonCacheAndImageUrls } from '../utils/sync';
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
  const { getPersonTaggedUrls } = usePerson();
  const { getDefaultOrRootFolderUrls } = useBookmark();
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);

  useEffect(() => {
    getAllDecodedPersons().then((decodedPersons) => {
      setPersons(sortAlphabetically(decodedPersons));
      setIsFetching(false);
    });
  }, []);

  // Read once under a stable key; previously this re-ran (and re-parsed the whole
  // bookmarks blob) on every keystroke because searchText was an effect dep
  const { data: urls = [] } = useSWR(
    'default-folder-urls',
    getDefaultOrRootFolderUrls
  );

  const orderedPersons = orderByRecency
    ? sortByRecency(persons, urls)
    : persons;
  const filteredAndOrderedPersons = getFilteredPersons(
    orderedPersons,
    searchText
  );

  const handleAddOrEditPerson = async (person: IPerson) => {
    setIsFetching(true);
    const pos = getPersonPos(persons, person);
    const isNewPerson = pos === -1;
    const newPersons = [...persons];
    if (isNewPerson) {
      // Add person
      newPersons.push(person);
    } else {
      // Update person
      newPersons[pos] = person;
    }
    // Update person cache
    await updatePersonCacheAndImageUrls(person);
    // Update in the list
    const sortedPersons = sortAlphabetically(newPersons);
    setPersons(sortedPersons);
    await handleSave(sortedPersons);
    setIsFetching(false);
    toast.success(
      `${person.name} ${isNewPerson ? 'added' : 'updated'} successfully`
    );
  };

  const handlePersonDelete = async (person: IPerson) => {
    const pos = getPersonPos(persons, person);
    const taggedUrls = await getPersonTaggedUrls(person.uid);
    if (taggedUrls.length > 0) {
      toast.error('Cannot delete a person with tagged bookmarks');
      return;
    }
    setIsFetching(true);
    const newPersons = [...persons];
    newPersons.splice(pos, 1);
    setPersons(newPersons);
    await trpcApi.storage.removeFile.mutate(getPersonImageName(person.uid));
    await handleSave(newPersons);
    setIsFetching(false);
    toast.success('Person deleted successfully');
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
