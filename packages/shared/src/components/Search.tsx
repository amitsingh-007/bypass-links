import { InputGroup, InputGroupAddon, InputGroupInput } from '@bypass/ui';
import { useDebounce, useKeyPress } from 'ahooks';
import { memo, useEffect, useState, forwardRef } from 'react';
import { GoSearch } from 'react-icons/go';

interface SearchProps {
  onChange: (searchText: string) => void;
}

const Search = forwardRef<HTMLInputElement, SearchProps>((props, ref) => {
  const { onChange } = props;
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, { wait: 200 });

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useKeyPress('meta.f', (event) => {
    event.preventDefault();
    if (typeof ref === 'object' && ref?.current) {
      ref.current.focus();
    }
  });

  return (
    <InputGroup className="w-32 sm:w-40">
      <InputGroupAddon>
        <GoSearch className="text-muted-foreground size-4" />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        placeholder="Search"
        onChange={(event) => setInputValue(event.currentTarget.value)}
      />
    </InputGroup>
  );
});

export default memo(Search);
