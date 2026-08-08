'use client';

import {
  getFilteredPersons,
  Header,
  Persons,
  sortByRecency,
  useDefaultFolderUrls,
  usePersons,
} from '@bypass/shared';
import { Switch } from '@bypass/ui';
import { useState } from 'react';

import PersonVirtualCell from './components/PersonVirtualCell';

function PersonsPage() {
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);

  const { data: persons = [] } = usePersons();
  const { data: urls = [] } = useDefaultFolderUrls();

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
            renderPerson={(person, imageUrl) => (
              <PersonVirtualCell person={person} imageUrl={imageUrl} />
            )}
          />
        ) : null}
      </div>
    </div>
  );
}

export default PersonsPage;
