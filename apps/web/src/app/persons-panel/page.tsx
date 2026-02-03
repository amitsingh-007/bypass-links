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
  sortByRecency,
  STORAGE_KEYS,
  useBookmark,
} from '@bypass/shared';
import { Box, Container, Switch } from '@mantine/core';
import { useEffect, useState } from 'react';
import PersonVirtualCell from './components/PersonVirtualCell';
import styles from './page.module.css';

const onLinkOpen = (url: string) => {
  openNewTab(url);
};

function PersonsPage() {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [filteredAndOrderedPersons, setFilteredAndOrderedPersons] = useState<
    IPerson[]
  >([]);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);
  const { getDefaultOrRootFolderUrls } = useBookmark();

  useEffect(() => {
    const _persons = getFromLocalStorage<IPersons>(STORAGE_KEYS.persons);
    if (!_persons) {
      return;
    }
    const decryptedPersons = Object.values(_persons || {}).map((x) =>
      getDecryptedPerson(x)
    );
    const alphabeticallySorted = sortAlphabetically(decryptedPersons);
    setPersons(alphabeticallySorted);
  }, []);

  useEffect(() => {
    const updatePersons = async () => {
      const urls = await getDefaultOrRootFolderUrls();
      const orderedPersons = orderByRecency
        ? sortByRecency(persons, urls)
        : persons;
      const filtered = getFilteredPersons(orderedPersons, searchText);
      setFilteredAndOrderedPersons(filtered);
    };
    updatePersons();
  }, [getDefaultOrRootFolderUrls, orderByRecency, persons, searchText]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };
  return (
    <Container size="md" h="100vh" px={0} className={styles.container}>
      <Header
        text={`Persons Panel (${filteredAndOrderedPersons?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      >
        <Switch
          size="md"
          label="Recency"
          color="yellow"
          wrapperProps={{ 'data-testid': 'recency-switch' }}
          classNames={{
            root: styles.orderBySwitch,
            labelWrapper: styles.orderBySwitchLabelWrapper,
            body: styles.orderBySwitchBody,
          }}
          checked={orderByRecency}
          onChange={() => setOrderByRecency((prev) => !prev)}
        />
      </Header>
      <Box className={styles.innerContainer}>
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            persons={filteredAndOrderedPersons}
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
