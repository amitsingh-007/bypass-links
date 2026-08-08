import { ScrollArea } from '@bypass/ui';
import { useElementSize } from '@mantine/hooks';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type ReactNode, use, useCallback, useState } from 'react';

import useIsMobile from '../../../hooks/useIsMobile';
import QueryStringContext from '../../../provider/QueryStringContext';
import { deserializeQueryStringToObject } from '../../../utils/url';
import { ScrollButton } from '../../ScrollButton';
import usePersonImageMap from '../hooks/usePersonImageMap';
import { type IBookmarkWithFolder } from '../interfaces/bookmark';
import { type IPerson } from '../interfaces/persons';
import { getColumnCount, getReactKey } from '../utils';
import BookmarksList from './BookmarksList';

interface Props {
  persons: IPerson[];
  scrollButton?: boolean;
  bookmarkListProps: {
    fullscreen: boolean;
    onBookmarkEdit?: (bookmark: IBookmarkWithFolder) => void;
  };
  renderPerson: (person: IPerson, imageUrl: string) => ReactNode;
}

type InnerProps = Props & {
  bodyWidth: number;
  scrollElement: HTMLDivElement | null;
  personToOpen: IPerson | undefined;
  personToOpenImage: string;
  imageUrls: Record<string, string>;
};

function PersonsInner({
  persons,
  scrollButton = false,
  bookmarkListProps,
  bodyWidth,
  scrollElement,
  personToOpen,
  personToOpenImage,
  imageUrls,
  renderPerson,
}: InnerProps) {
  const isMobile = useIsMobile();
  const columnCount = getColumnCount(isMobile);
  const rowCount = Math.ceil(persons.length / columnCount);
  const columnDimension = (bodyWidth - 12) / columnCount; // Adjust scrollbar width
  const rowDimension = columnDimension + (isMobile ? 20 : 2);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => rowDimension,
    overscan: 2,
    getScrollElement: () => scrollElement,
  });

  const handleScroll = (itemNumber: number) =>
    rowVirtualizer.scrollToIndex(itemNumber);

  return (
    <>
      {scrollButton && (
        <ScrollButton itemsSize={rowCount} onScroll={handleScroll} />
      )}
      <div
        className="relative w-full"
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 flex w-full pl-1.5"
            style={{
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {Array.from({ length: columnCount }, (_, columnIndex) => {
              const personIndex = getReactKey(
                virtualRow.index,
                columnIndex,
                columnCount
              );
              if (personIndex >= persons.length) {
                return null;
              }
              const person = persons[personIndex];

              return (
                <div key={person.uid} style={{ width: columnDimension }}>
                  {renderPerson(person, imageUrls[person.uid] ?? '')}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <BookmarksList
        personToOpen={personToOpen}
        imageUrl={personToOpenImage}
        {...bookmarkListProps}
      />
    </>
  );
}

function Persons(props: Props) {
  const { persons } = props;
  const { ref: containerRef, width: bodyWidth } =
    useElementSize<HTMLDivElement>();
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const handleViewportRef = useCallback((node: HTMLDivElement | null) => {
    setScrollElement(node);
  }, []);
  const queryString = use(QueryStringContext);

  const { openBookmarksList } = deserializeQueryStringToObject(queryString);
  const personToOpen = persons.find(
    (person) => person.uid === openBookmarksList
  );
  const imageUrls = usePersonImageMap(persons.map(({ uid }) => uid));

  return (
    <ScrollArea
      ref={containerRef}
      viewportRef={handleViewportRef}
      className="size-full"
    >
      {bodyWidth > 0 && (
        <PersonsInner
          {...props}
          bodyWidth={bodyWidth}
          scrollElement={scrollElement}
          personToOpen={personToOpen}
          personToOpenImage={
            personToOpen ? (imageUrls[personToOpen.uid] ?? '') : ''
          }
          imageUrls={imageUrls}
        />
      )}
    </ScrollArea>
  );
}

export default Persons;
