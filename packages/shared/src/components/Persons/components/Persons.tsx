import { ScrollArea } from '@bypass/ui';
import { useSize } from 'ahooks';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import usePlatform from '../../../hooks/usePlatform';
import DynamicContext from '../../../provider/DynamicContext';
import { deserializeQueryStringToObject } from '../../../utils/url';
import { ScrollButton } from '../../ScrollButton';
import usePerson from '../hooks/usePerson';
import { type IPerson } from '../interfaces/persons';
import { getColumnCount, getReactKey } from '../utils';
import BookmarksList from './BookmarksList';

interface Props {
  persons: IPerson[];
  onLinkOpen: (url: string) => void;
  scrollButton?: boolean;
  bookmarkListProps: { fullscreen: boolean; showEditButton?: boolean };
  renderPerson: (person: IPerson) => ReactNode;
}

type InnerProps = Props & {
  bodyWidth: number;
  bodyRef: RefObject<HTMLDivElement | null>;
  personToOpen: IPerson | undefined;
  personToOpenImage: string;
};

function PersonsInner({
  persons,
  onLinkOpen,
  scrollButton = false,
  bookmarkListProps,
  bodyWidth,
  bodyRef,
  personToOpen,
  personToOpenImage,
  renderPerson,
}: InnerProps) {
  const isMobile = usePlatform();
  const columnCount = getColumnCount(isMobile);
  const rowCount = Math.ceil(persons.length / columnCount);
  const columnDimension = (bodyWidth - 12) / columnCount; // Adjust scrollbar width
  const rowDimension = columnDimension + (isMobile ? 40 : 2);
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(persons.length / columnCount),
    estimateSize: () => rowDimension,
    overscan: 2,
    getScrollElement: () => bodyRef.current,
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
            {Array.from({ length: columnCount })
              .fill(0)
              .map((_, columnIndex) => {
                const personIndex = getReactKey(
                  virtualRow.index,
                  columnIndex,
                  getColumnCount(isMobile)
                );
                if (personIndex >= persons.length) {
                  return null;
                }
                const person = persons[personIndex];

                return (
                  <div key={person.uid} style={{ width: columnDimension }}>
                    {renderPerson(person)}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
      <BookmarksList
        personToOpen={personToOpen}
        imageUrl={personToOpenImage}
        onLinkOpen={onLinkOpen}
        {...bookmarkListProps}
      />
    </>
  );
}

function Persons(props: Props) {
  const { persons } = props;
  const [personToOpen, setPersonToOpen] = useState<IPerson>();
  const [personToOpenImage, setPersonToOpenImage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);
  const width = size?.width ?? 0;
  const { location } = useContext(DynamicContext);
  const queryString = location.query();
  const { resolvePersonImageFromUid } = usePerson();

  useEffect(() => {
    const { openBookmarksList } = deserializeQueryStringToObject(queryString);
    const person = persons.find((_person) => _person.uid === openBookmarksList);
    setPersonToOpen(person);
    if (person) {
      resolvePersonImageFromUid(person.uid).then((url) => {
        setPersonToOpenImage(url);
      });
    }
  }, [queryString, persons, resolvePersonImageFromUid]);

  return (
    <ScrollArea
      ref={containerRef}
      viewportRef={scrollAreaRef}
      className="size-full"
    >
      {width > 0 && (
        <PersonsInner
          {...props}
          bodyWidth={width}
          bodyRef={scrollAreaRef}
          personToOpen={personToOpen}
          personToOpenImage={personToOpenImage}
        />
      )}
    </ScrollArea>
  );
}

export default Persons;
