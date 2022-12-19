import { Box, GlobalStyles } from '@mui/material';
import { PANEL_DIMENSIONS_PX, PANEL_SIZE } from 'GlobalConstants/styles';
import { getPersons } from 'GlobalHelpers/fetchFromStorage';
import { removeImageFromFirebase } from 'GlobalHelpers/firebase/storage';
import { useEffect, useMemo, useState } from 'react';
import {
  SORT_ORDER,
  SORT_TYPE,
} from '@bypass/shared/components/Persons/constants/sort';
import {
  IPerson,
  IPersons,
} from '@bypass/shared/components/Persons/interfaces/persons';
import { decryptionMapper } from '@bypass/shared/components/Persons/mapper';
import { getPersonPos, setPersonsInStorage } from '../utils';
import { sortByBookmarksCount } from '../utils/sort';
import { updatePersonCacheAndImageUrls } from '../utils/sync';
import Header from './Header';
import Persons from '@bypass/shared/components/Persons/components/Persons';
import PersonVirtualCell from './PersonVirtualCell';
import tabs from 'GlobalHelpers/chrome/tabs';
import {
  getFilteredPersons,
  sortAlphabetically,
} from '@bypass/shared/components/Persons/utils';
import { GRID_COLUMN_SIZE } from '../constants';
import useToastStore from 'GlobalStore/toast';
import useHistoryStore from 'GlobalStore/history';

const sizeConfig = {
  gridColumnSize: GRID_COLUMN_SIZE,
  panelHeight: PANEL_SIZE.height,
  panelWidth: PANEL_SIZE.width,
};

const PersonsPanel = () => {
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );
  const displayToast = useToastStore((state) => state.displayToast);
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getPersons().then((persons) => {
      const decryptedPersons = Object.entries(persons || {}).map(
        decryptionMapper
      );
      setPersons(sortAlphabetically(SORT_ORDER.asc, decryptedPersons));
      setIsFetching(false);
    });
  }, []);

  const handleSave = async (persons: IPerson[]) => {
    const encryptedPersons = persons.reduce<IPersons>(
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
      //Add person
      newPersons.push(person);
    } else {
      //Update person
      newPersons[pos] = person;
    }
    //Update person cache
    await updatePersonCacheAndImageUrls(person);
    //Update in the list
    const sortedPersons = sortAlphabetically(SORT_ORDER.asc, newPersons);
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

  const handleSort = (sortType: SORT_TYPE, sortOrder: SORT_ORDER) => {
    let sortFn = null;
    if (sortType === SORT_TYPE.alphabetically) {
      sortFn = sortAlphabetically;
    } else if (sortType === SORT_TYPE.bookmarks) {
      sortFn = sortByBookmarksCount;
    } else {
      throw new Error('Unknown sort type encountered');
    }
    setPersons(sortFn(sortOrder, persons));
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
    <>
      <GlobalStyles
        styles={{ body: { '::-webkit-scrollbar': { width: '0px' } } }}
      />
      <Box sx={{ width: PANEL_DIMENSIONS_PX.width }}>
        <Header
          isFetching={isFetching}
          handleAddPerson={handleAddOrEditPerson}
          persons={filteredPersons}
          handleSort={handleSort}
          onSearchChange={handleSearchTextChange}
        />
        <Box sx={{ minHeight: PANEL_DIMENSIONS_PX.height }}>
          {filteredPersons.length > 0 ? (
            <Persons
              persons={filteredPersons}
              handleEditPerson={handleAddOrEditPerson}
              handlePersonDelete={handlePersonDelete}
              virtualCell={PersonVirtualCell}
              onLinkOpen={onLinkOpen}
              sizeConfig={sizeConfig}
              bookmarkListProps={{ fullscreen: true, focusSearch: true }}
              scrollButton
            />
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default PersonsPanel;
