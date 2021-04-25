import { InputBase, makeStyles } from "@material-ui/core";
import { alpha } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { memo } from "react";
import { throttle } from "throttle-debounce";

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    width: "auto",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "12ch",
    "&:focus": {
      width: "20ch",
    },
  },
}));

/**
 * `searchClassName` should be parent of each row and not parent of all rows
 * `data-text` and `data-subtext` should be applied on same node as of `searchClassName`
 */
const SearchInput = memo(({ searchClassName }) => {
  const classes = useStyles();

  const handleSearch = (searchText = "") => {
    const lowerSearchText = searchText.toLowerCase();

    document.querySelectorAll(`.${searchClassName}`).forEach((node) => {
      const textsToSearch = [
        node.getAttribute("data-text")?.toLowerCase(),
        node.getAttribute("data-subtext")?.toLowerCase(),
      ];

      const isSearchMatched = textsToSearch.some(
        (text) => text && text.includes(lowerSearchText)
      );

      node.style.display = isSearchMatched ? "" : "none";
    });
  };

  const onChange = throttle(100, (event) => {
    handleSearch(event.target.value?.trim());
  });

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder="Search…"
        classes={{ input: classes.inputInput }}
        onChange={onChange}
        autoFocus
      />
    </div>
  );
});

export default SearchInput;
