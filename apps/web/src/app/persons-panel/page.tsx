'use client';

import {
  decodePersons,
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
import useSWR from 'swr';

import { getFromLocalStorage } from '@app/utils/storage';

import PersonVirtualCell from './components/PersonVirtualCell';

function PersonsPage() {
  const [persons, setPersons] = useState<IPerson[]>([]);
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);
  const { getDefaultOrRootFolderUrls } = useBookmark();

  useEffect(() => {
    const storedPersons = getFromLocalStorage<IPersons>(STORAGE_KEYS.persons);
    if (!storedPersons) {
      return;
    }
    const alphabeticallySorted = sortAlphabetically(
      decodePersons(storedPersons)
    );
    // oxlint-disable-next-line react/react-compiler
    setPersons(alphabeticallySorted);
  }, []);

  // Stable key: keyed on searchText this re-parsed the whole bookmarks blob per keystroke
  const { data: urls = [] } = useSWR(
    'default-folder-urls',
    getDefaultOrRootFolderUrls
  );

  const orderedPersons = orderByRecency
    ? sortByRecency(persons, urls)
    : persons;
  const filteredAndOrderedPersons = getFilteredPersons(
    orderedPersons,
    searchText
  );

  return (
    <div className="max-w-panel mx-auto flex h-screen flex-col px-0">
      <Header
        text={`Persons Panel (${filteredAndOrderedPersons?.length || 0})`}
        onSearchChange={setSearchText}
      >
        <div className="flex items-center gap-2">
          <Switch
            data-testid="recency-switch"
            checked={orderByRecency}
            onCheckedChange={() => setOrderByRecency((prev) => !prev)}
          />
          <span className="hidden text-sm sm:block">Recency</span>
        </div>
      </Header>
      <div className="min-h-0 flex-1">
        {filteredAndOrderedPersons.length > 0 ? (
          <Persons
            persons={filteredAndOrderedPersons}
            bookmarkListProps={{ fullscreen: false }}
            renderPerson={(person) => <PersonVirtualCell person={person} />}
          />
        ) : null}
      </div>
    </div>
  );
}

export default PersonsPage;
