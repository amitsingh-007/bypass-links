import { Box, Typography } from '@mui/material';
import { BlackTooltip } from '../../StyledComponents';
import { memo, useCallback, useEffect, useState } from 'react';
import PersonAvatars from '../../Persons/components/PersonAvatars';
import { IPersonWithImage } from '../../Persons/interfaces/persons';
import {
  getPersonsFromUids,
  getPersonsWithImageUrl,
} from '../../../../../extension/src/PersonsPanel/utils'; //TODO: Do after fetching persons from fb for web
import Favicon from '../../Favicon';
import md5 from 'md5';
import { SxProps } from '@mui/system';

const titleStyles = { flexGrow: 1, fontSize: '14px' };
const tooltipStyles = { fontSize: '13px' };

export interface Props {
  url: string;
  title: string;
  taggedPersons: string[];
  pos?: number;
  isSelected?: boolean;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
  containerStyles?: SxProps;
  onOpenLink: (url: string) => void;
}

const Bookmark = memo<Props>(
  ({
    url,
    title,
    pos = 0,
    taggedPersons,
    isSelected,
    handleSelectedChange,
    containerStyles = {},
    onOpenLink,
  }) => {
    const contextId = md5(url);
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
      if (event.ctrlKey || event.metaKey) {
        return;
      }
      onOpenLink(url);
    };

    const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!handleSelectedChange) {
        return;
      }
      const isCtrlOrCommandKey = event.ctrlKey || event.metaKey;
      handleSelectedChange(pos, !isCtrlOrCommandKey);
    };

    const onRightClick = () => {
      if (!isSelected && handleSelectedChange) {
        handleSelectedChange(pos, true);
      }
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          ...containerStyles,
        }}
        onDoubleClick={handleOpenLink}
        onClick={handleSelectionChange}
        onContextMenu={onRightClick}
        data-context-id={contextId}
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
        <Typography noWrap sx={titleStyles} data-context-id={contextId}>
          {title}
        </Typography>
      </Box>
    );
  }
);
Bookmark.displayName = 'Bookmark';

export default Bookmark;
