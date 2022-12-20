import { Box } from '@mui/material';
import { ScrollButton } from '../../ScrollButton';
import { deserialzeQueryStringToObject } from '../../../utils/url';
import { memo, useEffect, useRef, useState, useContext } from 'react';
import { FixedSizeGrid } from 'react-window';
import { IPerson } from '../interfaces/persons';
import { getReactKey } from '../utils';
import BookmarksList from './BookmarksList';
import usePerson from '../hooks/usePerson';
import DynamicContext from '../../../provider/DynamicContext';

interface Props {
  persons: IPerson[];
  handleEditPerson?: (person: IPerson) => void;
  handlePersonDelete?: (person: IPerson) => void;
  onLinkOpen: (url: string) => void;
  scrollButton?: boolean;
  sizeConfig: {
    gridColumnSize: number;
    panelHeight: number;
    panelWidth: number;
  };
  bookmarkListProps: {
    fullscreen: boolean;
    focusSearch: boolean;
  };
  virtualCell: React.ComponentType<{
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
    data: any;
  }>;
}

const PADDING = 6;

const Persons = memo<Props>(function Persons({
  persons,
  handleEditPerson,
  handlePersonDelete,
  onLinkOpen,
  scrollButton = false,
  sizeConfig,
  bookmarkListProps,
  virtualCell: VirtualCell,
}) {
  const { location } = useContext(DynamicContext);
  const queryString = location.query();
  const gridRef = useRef<any>(null);
  const [personToOpen, setPersonToOpen] = useState<IPerson | null>(null);
  const [personToOpenImage, setPersonToOpenImage] = useState('');
  const { resolvePersonImageFromUid } = usePerson();

  useEffect(() => {
    const { openBookmarksList } = deserialzeQueryStringToObject(queryString);
    const person =
      (openBookmarksList &&
        persons.find((person) => person.uid === openBookmarksList)) ||
      null;
    setPersonToOpen(person);
    if (person) {
      resolvePersonImageFromUid(person.uid).then((url) => {
        setPersonToOpenImage(url);
      });
    }
  }, [queryString, persons, resolvePersonImageFromUid]);

  const handleScroll = (itemNumber: number) => {
    gridRef.current?.scrollToItem({ rowIndex: itemNumber });
  };

  const rowCount = Math.ceil(persons.length / sizeConfig.gridColumnSize);
  const topBottomPadding = PADDING * 2;
  const cellDimension =
    (sizeConfig.panelWidth - topBottomPadding) / sizeConfig.gridColumnSize;
  return (
    <>
      {scrollButton && (
        <ScrollButton itemsSize={rowCount} onScroll={handleScroll} />
      )}
      <Box sx={{ padding: `${PADDING}px` }}>
        <FixedSizeGrid<React.ComponentProps<typeof VirtualCell>['data']>
          height={sizeConfig.panelHeight - topBottomPadding}
          width={sizeConfig.panelWidth}
          rowCount={rowCount}
          columnCount={sizeConfig.gridColumnSize}
          rowHeight={cellDimension}
          columnWidth={cellDimension}
          overscanRowCount={2}
          itemKey={({ rowIndex, columnIndex, data }) => {
            const index = getReactKey(
              rowIndex,
              columnIndex,
              sizeConfig.gridColumnSize
            );
            const person = data.persons[index];
            return person?.uid ?? `${rowIndex}_${columnIndex}`;
          }}
          itemData={{ persons, handleEditPerson, handlePersonDelete }}
          ref={gridRef}
        >
          {VirtualCell}
        </FixedSizeGrid>
      </Box>
      {personToOpen && (
        <BookmarksList
          name={personToOpen.name}
          imageUrl={personToOpenImage}
          taggedUrls={personToOpen.taggedUrls}
          onLinkOpen={onLinkOpen}
          {...bookmarkListProps}
        />
      )}
    </>
  );
});

export default Persons;
