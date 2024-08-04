import { trpcApi } from '@/apis/trpcApi';
import { MAX_PANEL_SIZE } from '@/constants';
import {
  decryptionMapper,
  getFilteredPersons,
  getPersonImageName,
  HEADER_HEIGHT,
  IPerson,
  IPersons,
  Persons,
  sortAlphabetically,
  usePerson,
} from '@bypass/shared';
import { getPersons } from '@helpers/fetchFromStorage';
import { Box, Flex } from '@mantine/core';
import useHistoryStore from '@store/history';
import useToastStore from '@store/toast';
import { useEffect, useMemo, useState } from 'react';
import { getPersonPos, setPersonsInStorage } from '../utils';
import { updatePersonCacheAndImageUrls } from '../utils/sync';
import PersonHeader from './PersonHeader';
import PersonVirtualCell from './PersonVirtualCell';

const PersonsPanel = () => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const displayToast = useToastStore((state) => state.displayToast);
  const { getPersonTaggedUrls } = usePerson();
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getPersons().then((_persons) => {
      const decryptedPersons = Object.entries(_persons || {}).map((x) =>
        decryptionMapper(x)
      );
      setPersons(sortAlphabetically(decryptedPersons));
      setIsFetching(false);
    });
  }, []);

  const handleSave = async (_persons: IPerson[]) => {
    const encryptedPersons = _persons.reduce<IPersons>((obj, { uid, name }) => {
      obj[uid] = {
        uid,
        name: btoa(name),
      };
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
    displayToast({ message: 'Person added/updated successfully' });
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
    displayToast({ message: 'Person deleted successfully' });
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const onLinkOpen = (url: string) => {
    startHistoryMonitor();
    chrome.tabs.create({ url, active: false });
  };

  const filteredPersons = useMemo(
    () => getFilteredPersons(persons, searchText),
    [persons, searchText]
  );

  return (
    <Flex direction="column" w={MAX_PANEL_SIZE.WIDTH} h={MAX_PANEL_SIZE.HEIGHT}>
      <PersonHeader
        isFetching={isFetching}
        handleAddPerson={handleAddOrEditPerson}
        persons={filteredPersons}
        onSearchChange={handleSearchTextChange}
      />
      <Box pos="relative" h={MAX_PANEL_SIZE.HEIGHT - HEADER_HEIGHT}>
        {filteredPersons.length > 0 ? (
          <Persons
            persons={filteredPersons}
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
