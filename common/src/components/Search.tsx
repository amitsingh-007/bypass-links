import { Box, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { memo, useEffect, useRef } from 'react';
import { GoSearch } from 'react-icons/go';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'throttle-debounce';
import { IntersectionObserverResponse } from '../interfaces/overrides';

interface Props {
  onChange: (searchText: string) => void;
}

const Search = memo<Props>(function Search({ onChange }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref, entry }: IntersectionObserverResponse = useInView({
    trackVisibility: true,
    delay: 100,
  });

  const onInputChange = debounce(
    300,
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value ?? '');
    }
  );

  useEffect(() => {
    if (entry?.isVisible) {
      inputRef?.current?.focus();
    }
  }, [entry?.isVisible]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
      }
    };
    const node = inputRef?.current;
    node?.addEventListener('keydown', handleKeyPress);
    return () => {
      node?.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '40px',
        backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
        '&:hover': {
          backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
        },
        width: 'auto',
      }}
      ref={ref as React.Ref<unknown>}
    >
      <Box
        sx={{
          padding: (theme) => theme.spacing(0, 2),
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GoSearch />
      </Box>
      <InputBase
        placeholder="Search…"
        onChange={onInputChange}
        sx={{
          '& .MuiInputBase-input': {
            padding: (theme) => theme.spacing(1, 1, 1, 0),
            paddingLeft: (theme) => `calc(1em + ${theme.spacing(4)})`,
            transition: (theme) => theme.transitions.create('width'),
            width: '12ch',
            '&:focus': { width: '20ch' },
          },
        }}
        inputRef={inputRef}
      />
    </Box>
  );
});

export default Search;
