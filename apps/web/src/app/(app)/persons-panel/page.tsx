'use client';

import { Header, Person, Persons, useOrderedPersons } from '@bypass/shared';
import { Switch } from '@bypass/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function PersonsPage() {
  const queryString = useSearchParams()?.toString() ?? '';
  const [searchText, setSearchText] = useState('');
  const [orderByRecency, setOrderByRecency] = useState(true);

  const { data: filteredAndOrderedPersons } = useOrderedPersons(
    orderByRecency,
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
            queryString={queryString}
            persons={filteredAndOrderedPersons}
            fullscreen={false}
            renderPerson={(person, imageUrl) => (
              <div className="h-full p-1.5">
                <Person person={person} imageUrl={imageUrl} />
              </div>
            )}
          />
        ) : null}
      </div>
    </div>
  );
}

export default PersonsPage;
