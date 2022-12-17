import Header from '@/ui/components/Header';
import MetaTags from '@/ui/components/MetaTags';
import PersonVirtualCell from '@/ui/PersonsPage/components/PersonVirtualCell';
import { GRID_COLUMN_SIZE } from '@/ui/PersonsPage/constants';
import { getFromLocalStorage } from '@/ui/provider/utils';
import { openNewTab } from '@/ui/utils';
import Persons from '@common/components/Persons/components/Persons';
import {
  IPerson,
  IPersons,
} from '@common/components/Persons/interfaces/persons';
import {
  getFilteredPersons,
  sortAlphabetically,
} from '@common/components/Persons/utils';
import { STORAGE_KEYS } from '@common/constants/storage';
import { Box, Container } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useMeasure } from 'react-use';
import { SORT_ORDER } from '@common/components/Persons/constants/sort';
import { decryptionMapper } from '@common/components/Persons/mapper';

const PersonsPage = () => {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [searchText, setSearchText] = useState('');
  const [contentRef, { width: contentWidth, height: contentHeight }] =
    useMeasure();

  useEffect(() => {
    getFromLocalStorage<IPersons>(STORAGE_KEYS.persons).then((persons) => {
      if (!persons) {
        return;
      }
      const decryptedPersons = Object.entries(persons || {}).map(
        decryptionMapper
      );
      setPersons(sortAlphabetically(SORT_ORDER.asc, decryptedPersons));
    });
  }, []);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const onLinkOpen = (url: string) => {
    openNewTab(url);
  };

  const filteredPersons = useMemo(
    () => getFilteredPersons(persons, searchText),
    [persons, searchText]
  );
  return (
    <Container
      maxWidth="md"
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <MetaTags titleSuffix="Bookmarks Panel" />
      <Header
        title={`PERSONS PANEL (${filteredPersons?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      />
      <Box ref={contentRef} sx={{ flex: 1 }}>
        {filteredPersons.length > 0 ? (
          <Persons
            persons={filteredPersons}
            virtualCell={PersonVirtualCell}
            onLinkOpen={onLinkOpen}
            sizeConfig={{
              gridColumnSize: GRID_COLUMN_SIZE,
              panelHeight: contentHeight,
              panelWidth: contentWidth,
            }}
            bookmarkListProps={{ fullscreen: false, focusSearch: false }}
          />
        ) : null}
      </Box>
    </Container>
  );
};

export default PersonsPage;
