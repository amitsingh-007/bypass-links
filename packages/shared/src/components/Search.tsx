import { InputGroup, InputGroupAddon, InputGroupInput } from '@bypass/ui';
import { useDebounce, useKeyPress } from 'ahooks';
import { memo, useEffect, useState } from 'react';
import { GoSearch } from 'react-icons/go';

interface SearchProps {
  onChange: (searchText: string) => void;
}

const Search = memo<SearchProps>(({ onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, { wait: 200 });

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useKeyPress(['meta.f'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('search-input')?.focus();
  });

  return (
    <InputGroup
      className="
        w-32
        sm:w-40
      "
    >
      <InputGroupAddon>
        <GoSearch className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        id="search-input"
        placeholder="Search"
        onChange={(event) => setInputValue(event.currentTarget.value)}
      />
    </InputGroup>
  );
});

export default Search;
