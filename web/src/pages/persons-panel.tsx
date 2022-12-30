import MetaTags from '@/ui/components/MetaTags';
import PersonVirtualCell from '@/ui/PersonsPage/components/PersonVirtualCell';
import { getFromLocalStorage } from '@/ui/provider/utils';
import { openNewTab } from '@/ui/utils';
import Header from '@bypass/shared/components/Header';
import Persons from '@bypass/shared/components/Persons/components/Persons';
import {
  IPerson,
  IPersons,
} from '@bypass/shared/components/Persons/interfaces/persons';
import { decryptionMapper } from '@bypass/shared/components/Persons/mapper';
import {
  getFilteredPersons,
  sortAlphabetically,
} from '@bypass/shared/components/Persons/utils';
import { STORAGE_KEYS } from '@bypass/shared/constants/storage';
import { Box, Container } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

const PersonsPage = () => {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getFromLocalStorage<IPersons>(STORAGE_KEYS.persons).then((persons) => {
      if (!persons) {
        return;
      }
      const decryptedPersons = Object.entries(persons || {}).map(
        decryptionMapper
      );
      setPersons(sortAlphabetically(decryptedPersons));
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
      size="md"
      h="100vh"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <MetaTags titleSuffix="Bookmarks Panel" />
      <Header
        onSearchChange={handleSearchTextChange}
        text={`Persons Panel (${filteredPersons?.length || 0})`}
      />
      <Box sx={{ flex: 1 }}>
        {filteredPersons.length > 0 ? (
          <Persons
            persons={filteredPersons}
            virtualCell={PersonVirtualCell}
            onLinkOpen={onLinkOpen}
            bookmarkListProps={{ fullscreen: false, focusSearch: false }}
          />
        ) : null}
      </Box>
    </Container>
  );
};

export default PersonsPage;
