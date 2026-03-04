import { InputGroup, InputGroupAddon, InputGroupInput } from '@bypass/ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search02Icon } from '@hugeicons/core-free-icons';
import { useDebouncedState, useHotkeys } from '@mantine/hooks';
import { memo, useEffect } from 'react';

interface SearchProps {
  onChange: (searchText: string) => void;
}

const Search = memo<SearchProps>(({ onChange }) => {
  const [debouncedValue, setDebouncedValue] = useDebouncedState('', 200);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useHotkeys([
    [
      'mod+F',
      (e) => {
        e.preventDefault();

        const searchInputs = [
          ...document.querySelectorAll<HTMLInputElement>(
            'input[data-search-input="true"]'
          ),
        ];

        const visibleSearchInputs = searchInputs.filter(
          (input) =>
            (input.checkVisibility?.() ?? input.offsetParent !== null) &&
            !input.disabled
        );

        const targetInput = visibleSearchInputs.at(-1);

        targetInput?.focus();
      },
    ],
  ]);

  return (
    <InputGroup
      className="
        w-32
        sm:w-40
      "
    >
      <InputGroupAddon>
        <HugeiconsIcon
          icon={Search02Icon}
          className="size-4 text-muted-foreground"
        />
      </InputGroupAddon>
      <InputGroupInput
        data-search-input="true"
        placeholder="Search"
        onChange={(event) => setDebouncedValue(event.currentTarget.value)}
      />
    </InputGroup>
  );
});

export default Search;
