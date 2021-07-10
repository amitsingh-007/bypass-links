import { Box, InputBase, InputBaseProps } from "@material-ui/core";
import { alpha } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { IntersectionObserverResponse } from "GlobalInterfaces/overrides";
import { useState } from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { memo } from "react";
import { useInView } from "react-intersection-observer";
import { throttle } from "throttle-debounce";

const refOptions = { trackVisibility: true, delay: 100 };

/**
 * `searchClassName` should be parent of each row and not parent of all rows
 * `data-text` and `data-subtext` should be applied on same node as of `searchClassName`
 */
const SearchInput = memo<{ searchClassName: string }>(({ searchClassName }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const { ref, entry }: IntersectionObserverResponse = useInView(refOptions);

  const handleSearch = useCallback(
    (searchText: string) => {
      const lowerSearchText = searchText.toLowerCase();

      document
        .querySelectorAll<HTMLElement>(`.${searchClassName}`)
        .forEach((node) => {
          const textsToSearch = [
            node.getAttribute("data-text")?.toLowerCase(),
            node.getAttribute("data-subtext")?.toLowerCase(),
          ];

          const isSearchMatched = textsToSearch.some(
            (text) => text && text.includes(lowerSearchText)
          );

          node.style.display = isSearchMatched ? "" : "none";
        });
    },
    [searchClassName]
  );

  const onChange = throttle<React.ChangeEventHandler<HTMLInputElement>>(
    100,
    (event) => {
      setSearchText(event.target.value ?? "");
    }
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && searchText) {
        //Clear search box on Escape key press
        setSearchText("");
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [searchText]
  );

  useEffect(() => {
    handleSearch(searchText);
  }, [handleSearch, searchText]);

  useEffect(() => {
    if (entry?.isVisible) {
      inputRef?.current?.focus();
    }
  }, [entry?.isVisible]);

  useEffect(() => {
    const node = inputRef?.current;
    node?.addEventListener("keydown", handleKeyPress);
    return () => {
      node?.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "40px",
        backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
        "&:hover": {
          backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
        },
        width: "auto",
      }}
      ref={ref}
    >
      <Box
        sx={{
          padding: (theme) => theme.spacing(0, 2),
          height: "100%",
          position: "absolute",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SearchIcon />
      </Box>
      <InputBase
        placeholder="Search…"
        onChange={onChange}
        sx={{
          "& .MuiInputBase-input": {
            padding: (theme) => theme.spacing(1, 1, 1, 0),
            paddingLeft: (theme) => `calc(1em + ${theme.spacing(4)})`,
            transition: (theme) => theme.transitions.create("width"),
            width: "12ch",
            "&:focus": { width: "20ch" },
          },
        }}
        value={searchText}
        inputRef={inputRef}
      />
    </Box>
  );
});

export default SearchInput;
