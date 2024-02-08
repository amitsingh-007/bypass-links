import { FocusTrap, TextInput } from '@mantine/core';
import { useDebouncedState, useHotkeys } from '@mantine/hooks';
import { memo, useEffect, useState } from 'react';
import { GoSearch } from 'react-icons/go';

const Search = memo<{ onChange: (searchText: string) => void }>(
  function Search({ onChange }) {
    const [value, setValue] = useDebouncedState('', 200);
    const [active, setActive] = useState(false);

    useEffect(() => onChange(value), [onChange, value]);

    useHotkeys([
      [
        'mod+f',
        (event) => {
          event.stopPropagation();
          event.preventDefault();
          setActive(true);
        },
      ],
    ]);

    return (
      <FocusTrap active={active}>
        <TextInput
          leftSection={<GoSearch />}
          placeholder="Search"
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </FocusTrap>
    );
  }
);

export default Search;
