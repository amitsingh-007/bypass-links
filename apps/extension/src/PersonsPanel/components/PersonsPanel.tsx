import {
  getDecryptedPerson,
  getEncryptedPerson,
  getFilteredPersons,
  getOrderedPersons,
  getPersonImageName,
  HEADER_HEIGHT,
  IPerson,
  IPersons,
  Persons,
  sortAlphabetically,
  useBookmark,
  usePerson,
} from '@bypass/shared';
import { getPersons } from '@helpers/fetchFromStorage';
import { Box, Flex } from '@mantine/core';
import useHistoryStore from '@store/history';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { getPersonPos, setPersonsInStorage } from '../utils';
import { updatePersonCacheAndImageUrls } from '../utils/sync';
import PersonHeader from './PersonHeader';
import PersonVirtualCell from './PersonVirtualCell';
import { MAX_PANEL_SIZE } from '@/constants';
import { trpcApi } from '@/apis/trpcApi';

const PersonsPanel = () => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const { getPersonTaggedUrls } = usePerson();
  const { getDefaultOrRootFolderUrls } = useBookmark();
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [filteredAndOrderedPersons, setFilteredAndOrderedPersons] = useState<
    IPerson[]
  >([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(false);

  useEffect(() => {
    getPersons().then((_persons) => {
      const decryptedPersons = Object.values(_persons || {}).map((x) =>
        getDecryptedPerson(x)
      );
      setPersons(sortAlphabetically(decryptedPersons));
      setIsFetching(false);
    });
  }, []);

  useEffect(() => {
    const filterAndOrder = async () => {
      const urls = await getDefaultOrRootFolderUrls();
      const orderedPersons = orderByRecency
        ? getOrderedPersons(persons, urls)
        : persons;
      return getFilteredPersons(orderedPersons, searchText);
    };
    filterAndOrder().then((p) => setFilteredAndOrderedPersons(p));
  }, [getDefaultOrRootFolderUrls, orderByRecency, persons, searchText]);

  const handleSave = async (_persons: IPerson[]) => {
    const encryptedPersons = _persons.reduce<IPersons>((obj, person) => {
      obj[person.uid] = getEncryptedPerson(person);
      return obj;
    }, {});
    await setPersonsInStorage(encryptedPersons);
  };

  const handleAddOrEditPerson = async (person: IPerson) => {
    setIsFetching(true);
    const pos = getPersonPos(persons, person);
    const newPersons = [...persons];
    if (pos === -1) {
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
    notifications.show({ message: 'Person added/updated successfully' });
  };

  const handlePersonDelete = async (person: IPerson) => {
    const pos = getPersonPos(persons, person);
    const taggedUrls = await getPersonTaggedUrls(person.uid);
    if (taggedUrls.length > 0) {
      console.error('Cant delete a person with tagged urls');
      return;
    }
    setIsFetching(true);
    const newPersons = [...persons];
    newPersons.splice(pos, 1);
    setPersons(newPersons);
    await trpcApi.storage.removeFile.mutate(getPersonImageName(person.uid));
    await handleSave(newPersons);
    setIsFetching(false);
    notifications.show({ message: 'Person deleted successfully' });
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const toggleOrderByRecency = () => setOrderByRecency((prev) => !prev);

  const onLinkOpen = (url: string) => {
    startHistoryMonitor();
    chrome.tabs.create({ url, active: false });
  };

  return (
    <Flex direction="column" w={MAX_PANEL_SIZE.WIDTH} h={MAX_PANEL_SIZE.HEIGHT}>
      <PersonHeader
        isFetching={isFetching}
        handleAddPerson={handleAddOrEditPerson}
        persons={filteredAndOrderedPersons}
        onSearchChange={handleSearchTextChange}
        orderByRecency={orderByRecency}
        toggleOrderByRecency={toggleOrderByRecency}
      />
      <Box pos="relative" h={MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT}>
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            persons={filteredAndOrderedPersons}
            onLinkOpen={onLinkOpen}
            bookmarkListProps={{ fullscreen: true }}
            scrollButton
            renderPerson={(person) => (
              <PersonVirtualCell
                person={person}
                handleEditPerson={handleAddOrEditPerson}
                handlePersonDelete={handlePersonDelete}
              />
            )}
          />
        ) : null}
      </Box>
    </Flex>
  );
};

export default PersonsPanel;
