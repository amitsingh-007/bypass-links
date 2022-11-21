import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material';
import { memo } from 'react';
import {
  SORT_ORDER,
  SORT_TYPE,
} from '@common/components/Persons/constants/sort';

interface Props {
  onChange: (sortType: SORT_TYPE, sortOrder: SORT_ORDER) => void;
}

const Sort = memo<Props>(function Sort({ onChange }) {
  const handleChange: SelectProps<string>['onChange'] = (event) => {
    const [sortType, sortOrder] = event.target.value.split('-') as [
      SORT_TYPE,
      SORT_ORDER
    ];
    onChange(sortType, sortOrder);
  };

  return (
    <FormControl fullWidth variant="outlined" size="small" color="secondary">
      <InputLabel htmlFor="sort-select">Sort By</InputLabel>
      <Select
        defaultValue={`${SORT_TYPE.alphabetically}-${SORT_ORDER.asc}`}
        id="sort-select"
        label="Grouping"
        onChange={handleChange}
      >
        <ListSubheader>{SORT_TYPE.alphabetically}</ListSubheader>
        <MenuItem value={`${SORT_TYPE.alphabetically}-${SORT_ORDER.asc}`}>
          {SORT_ORDER.asc}
        </MenuItem>
        <MenuItem value={`${SORT_TYPE.alphabetically}-${SORT_ORDER.desc}`}>
          {SORT_ORDER.desc}
        </MenuItem>
        <ListSubheader>{SORT_TYPE.bookmarks}</ListSubheader>
        <MenuItem value={`${SORT_TYPE.bookmarks}-${SORT_ORDER.asc}`}>
          {SORT_ORDER.asc}
        </MenuItem>
        <MenuItem value={`${SORT_TYPE.bookmarks}-${SORT_ORDER.desc}`}>
          {SORT_ORDER.desc}
        </MenuItem>
      </Select>
    </FormControl>
  );
});

export default Sort;
