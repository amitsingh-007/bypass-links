import { Box } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { FixedSizeGrid } from 'react-window';
import DynamicContext from '../../../provider/DynamicContext';
import { deserializeQueryStringToObject } from '../../../utils/url';
import { ScrollButton } from '../../ScrollButton';
import { GRID_COLUMN_SIZE } from '../constants';
import usePerson from '../hooks/usePerson';
import { IPerson } from '../interfaces/persons';
import { getReactKey } from '../utils';
import BookmarksList from './BookmarksList';

interface Props {
  persons: IPerson[];
  handleEditPerson?: (person: IPerson) => void;
  handlePersonDelete?: (person: IPerson) => void;
  onLinkOpen: (url: string) => void;
  scrollButton?: boolean;
  bookmarkListProps: {
    fullscreen: boolean;
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
    const { openBookmarksList } = deserializeQueryStringToObject(queryString);
    const person =
      (openBookmarksList &&
        persons.find((_person) => _person.uid === openBookmarksList)) ||
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
  const cellDimension = (width - 8) / GRID_COLUMN_SIZE; // Adjust scrollbar width

  return (
    <>
      {scrollButton && (
        <ScrollButton itemsSize={rowCount} onScroll={handleScroll} />
      )}
      <Box h="100%" ref={ref}>
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
      <BookmarksList
        isOpen={Boolean(personToOpen)}
        name={personToOpen?.name}
        imageUrl={personToOpenImage}
        taggedUrls={personToOpen?.taggedUrls}
        onLinkOpen={onLinkOpen}
        {...bookmarkListProps}
      />
    </>
  );
});

export default Persons;
