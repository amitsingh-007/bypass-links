import MetaTags from '@/ui/components/MetaTags';
import PersonVirtualCell from '@/ui/PersonsPage/components/PersonVirtualCell';
import { getFromLocalStorage } from '@/ui/provider/utils';
import { openNewTab } from '@/ui/utils';
import {
  decryptionMapper,
  getFilteredPersons,
  Header,
  IPerson,
  IPersons,
  Persons,
  sortAlphabetically,
  STORAGE_KEYS,
} from '@bypass/shared';
import { Box, Container } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

const PersonsPage = () => {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getFromLocalStorage<IPersons>(STORAGE_KEYS.persons).then((_persons) => {
      if (!_persons) {
        return;
      }
      const decryptedPersons = Object.entries(_persons || {}).map(
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
            bookmarkListProps={{ fullscreen: false }}
          />
        ) : null}
      </Box>
    </Container>
  );
};

export default PersonsPage;
