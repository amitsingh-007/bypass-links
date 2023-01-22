import { MAX_PANEL_SIZE } from '@/constants';
import {
  decryptionMapper,
  getFilteredPersons,
  IPerson,
  IPersons,
  Persons,
  sortAlphabetically,
} from '@bypass/shared';
import tabs from '@helpers/chrome/tabs';
import { getPersons } from '@helpers/fetchFromStorage';
import { removeImageFromFirebase } from '@helpers/firebase/storage';
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
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getPersons().then((_persons) => {
      const decryptedPersons = Object.entries(_persons || {}).map(
        decryptionMapper
      );
      setPersons(sortAlphabetically(decryptedPersons));
      setIsFetching(false);
    });
  }, []);

  const handleSave = async (_persons: IPerson[]) => {
    const encryptedPersons = _persons.reduce<IPersons>(
      (obj, { uid, name, imageRef, taggedUrls }) => {
        obj[uid] = {
          uid,
          name: btoa(name),
          imageRef: btoa(encodeURIComponent(imageRef)),
          taggedUrls,
        };
        return obj;
      },
      {}
    );
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
    displayToast({ message: 'Person added/updated succesfully' });
  };

  const handlePersonDelete = async (person: IPerson) => {
    const pos = getPersonPos(persons, person);
    if (persons[pos].taggedUrls?.length > 0) {
      console.error('Cant delete a person with tagged urls');
      return;
    }
    setIsFetching(true);
    const newPersons = [...persons];
    newPersons.splice(pos, 1);
    setPersons(newPersons);
    await removeImageFromFirebase(person.imageRef);
    await handleSave(newPersons);
    setIsFetching(false);
    displayToast({ message: 'Person deleted succesfully' });
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const onLinkOpen = (url: string) => {
    startHistoryMonitor();
    tabs.create({ url, active: false });
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
      <Box pos="relative" sx={{ flex: 1 }}>
        {filteredPersons.length > 0 ? (
          <Persons
            persons={filteredPersons}
            handleEditPerson={handleAddOrEditPerson}
            handlePersonDelete={handlePersonDelete}
            virtualCell={PersonVirtualCell}
            onLinkOpen={onLinkOpen}
            bookmarkListProps={{ fullscreen: true }}
            scrollButton
          />
        ) : null}
      </Box>
    </Flex>
  );
};

export default PersonsPanel;
