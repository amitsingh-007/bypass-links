import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@material-ui/core";
import { memo } from "react";
import { SORT_ORDER, SORT_TYPE } from "../constants/sort";

const Sort = memo(({ onChange }) => {
  const handleChange = (event) => {
    const [sortType, sortOrder] = event.target.value.split("-");
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
