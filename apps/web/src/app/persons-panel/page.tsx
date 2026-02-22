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
import { Switch } from '@bypass/ui';
import { useEffect, useState } from 'react';
import PersonVirtualCell from './components/PersonVirtualCell';

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
    <div className="max-w-panel mx-auto flex h-screen flex-col px-0">
      <Header
        text={`Persons Panel (${filteredAndOrderedPersons?.length || 0})`}
        onSearchChange={handleSearchTextChange}
      >
        <div className="flex items-center gap-2">
          <Switch
            data-testid="recency-switch"
            checked={orderByRecency}
            onCheckedChange={() => setOrderByRecency((prev) => !prev)}
          />
          <span
            className="
              hidden text-sm
              sm:block
            "
          >
            Recency
          </span>
        </div>
      </Header>
      <div className="min-h-0 flex-1">
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            persons={filteredAndOrderedPersons}
            bookmarkListProps={{ fullscreen: false, showEditButton: false }}
            renderPerson={(person) => <PersonVirtualCell person={person} />}
            onLinkOpen={onLinkOpen}
          />
        ) : null}
      </div>
    </div>
  );
}

export default PersonsPage;
