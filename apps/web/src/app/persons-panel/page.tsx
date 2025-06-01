'use client';

import { openNewTab } from '@app/utils';
import { getFromLocalStorage } from '@app/utils/storage';
import {
  getDecryptedPerson,
  getFilteredPersons,
  Header,
  type IPerson,
  type IPersons,
  Persons,
  sortAlphabetically,
  STORAGE_KEYS,
} from '@bypass/shared';
import { Box, Container } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import PersonVirtualCell from './components/PersonVirtualCell';
import styles from './page.module.css';

const onLinkOpen = (url: string) => {
  openNewTab(url);
};

function PersonsPage() {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const _persons = getFromLocalStorage<IPersons>(STORAGE_KEYS.persons);
    if (!_persons) {
      return;
    }
    const decryptedPersons = Object.values(_persons || {}).map((x) =>
      getDecryptedPerson(x)
    );
    setPersons(sortAlphabetically(decryptedPersons));
  }, []);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const filteredPersons = useMemo(
    () => getFilteredPersons(persons, searchText),
    [persons, searchText]
  );
  return (
    <Container size="md" h="100vh" px={0} className={styles.container}>
      <Header
        text={`Persons Panel (${filteredPersons?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      />
      <Box className={styles.innerContainer}>
        {filteredPersons.length > 0 ? (
          <Persons
            persons={filteredPersons}
            bookmarkListProps={{ fullscreen: false }}
            renderPerson={(person) => <PersonVirtualCell person={person} />}
            onLinkOpen={onLinkOpen}
          />
        ) : null}
      </Box>
    </Container>
  );
}

export default PersonsPage;
