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
import { useElementSize } from '@mantine/hooks';
import { GRID_COLUMN_SIZE } from '../constants';

interface Props {
  persons: IPerson[];
  handleEditPerson?: (person: IPerson) => void;
  handlePersonDelete?: (person: IPerson) => void;
  onLinkOpen: (url: string) => void;
  scrollButton?: boolean;
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

const Persons = memo<Props>(function Persons({
  persons,
  handleEditPerson,
  handlePersonDelete,
  onLinkOpen,
  scrollButton = false,
  bookmarkListProps,
  virtualCell: VirtualCell,
}) {
  const { ref, width, height } = useElementSize();
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

  const rowCount = Math.ceil(persons.length / GRID_COLUMN_SIZE);
  const cellDimension = (width - 8) / GRID_COLUMN_SIZE;

  return (
    <>
      {scrollButton && (
        <ScrollButton itemsSize={rowCount} onScroll={handleScroll} />
      )}
      <Box sx={{ height: '100%' }} ref={ref}>
        <FixedSizeGrid<React.ComponentProps<typeof VirtualCell>['data']>
          height={height}
          width={width}
          rowCount={rowCount}
          columnCount={GRID_COLUMN_SIZE}
          rowHeight={cellDimension}
          columnWidth={cellDimension}
          overscanRowCount={2}
          itemKey={({ rowIndex, columnIndex, data }) => {
            const index = getReactKey(rowIndex, columnIndex);
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
