import { Box, Typography } from "@mui/material";
import { BlackTooltip } from "GlobalComponents/StyledComponents";
import tabs from "GlobalHelpers/chrome/tabs";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { startHistoryMonitor } from "SrcPath/HistoryPanel/actionCreators";
import PersonAvatars from "SrcPath/PersonsPanel/components/PersonAvatars";
import { IPersonWithImage } from "SrcPath/PersonsPanel/interfaces/persons";
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from "SrcPath/PersonsPanel/utils";
import withBookmarkRow, { InjectedProps } from "../hoc/withBookmarkRow";
import Favicon from "./Favicon";

const titleStyles = { flexGrow: 1, fontSize: "14px" };
const tooltipStyles = { fontSize: "13px" };

export interface Props extends InjectedProps {
  url: string;
  title: string;
  taggedPersons: string[];
  pos?: number;
  isSelected?: boolean;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
}

const Bookmark = memo<Props>(
  ({
    url,
    title,
    pos = 0,
    taggedPersons,
    isSelected,
    handleSelectedChange,
    containerStyles,
  }) => {
    const dispatch = useDispatch();
    const [personsWithImageUrls, setPersonsWithImageUrls] = useState<
      IPersonWithImage[]
    >([]);

    const initImageUrl = useCallback(async () => {
      const persons = await getPersonsFromUids(taggedPersons);
      const newPersonsWithImageUrls = await getPersonsWithImageUrl(persons);
      setPersonsWithImageUrls(newPersonsWithImageUrls);
    }, [taggedPersons]);

    useEffect(() => {
      initImageUrl();
    }, [initImageUrl]);

    const handleOpenLink: React.MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.ctrlKey) {
        return;
      }
      dispatch(startHistoryMonitor());
      tabs.create({ url, selected: false });
    };

    const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!handleSelectedChange) {
        return;
      }
      const isCtrlPressed = event.ctrlKey;
      handleSelectedChange(pos, !isCtrlPressed);
    };

    const onRightClick = () => {
      if (!isSelected && handleSelectedChange) {
        handleSelectedChange(pos, true);
      }
    };

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          ...containerStyles,
        }}
        onDoubleClick={handleOpenLink}
        onClick={handleSelectionChange}
        onContextMenu={onRightClick}
      >
        <BlackTooltip
          title={<Typography sx={tooltipStyles}>{url}</Typography>}
          arrow
          disableInteractive
          placement="right"
        >
          <Favicon url={url} />
        </BlackTooltip>
        <PersonAvatars persons={personsWithImageUrls} />
        <Typography noWrap sx={titleStyles}>
          {title}
        </Typography>
      </Box>
    );
  }
);
Bookmark.displayName = "Bookmark";

export const BookmarkExternal = Bookmark;
export default withBookmarkRow(BookmarkExternal);
