import { memo, useCallback, useEffect, useState } from 'react';
import Search from './Search';

/**
 * `searchClassName` should be parent of each row and not parent of all rows
 * `data-text` and `data-subtext` should be applied on same node as of `searchClassName`
 */
const SearchWrapper = memo<{ searchClassName: string }>(function SearchInput({
  searchClassName,
}) {
  const [searchText, setSearchText] = useState('');

  const handleSearch = useCallback(
    (searchText: string) => {
      const lowerSearchText = searchText.toLowerCase();

      document
        .querySelectorAll<HTMLElement>(`.${searchClassName}`)
        .forEach((node) => {
          const textsToSearch = [
            node.getAttribute('data-text')?.toLowerCase(),
            node.getAttribute('data-subtext')?.toLowerCase(),
          ];

          const isSearchMatched = textsToSearch.some(
            (text) => text && text.includes(lowerSearchText)
          );

          node.style.display = isSearchMatched ? '' : 'none';
        });
    },
    [searchClassName]
  );

  const onChange = (text: string) => {
    setSearchText(text);
  };

  useEffect(() => {
    handleSearch(searchText);
  }, [handleSearch, searchText]);

  return <Search onChange={onChange} />;
});

export default SearchWrapper;
