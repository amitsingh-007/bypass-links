import { Box, Flex } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  MutableRefObject,
  ReactNode,
  memo,
  useContext,
  useEffect,
  useState,
} from 'react';
import usePlatform from '../../../hooks/usePlatform';
import DynamicContext from '../../../provider/DynamicContext';
import { deserializeQueryStringToObject } from '../../../utils/url';
import { ScrollButton } from '../../ScrollButton';
import usePerson from '../hooks/usePerson';
import { IPerson } from '../interfaces/persons';
import { getColumnCount, getReactKey } from '../utils';
import BookmarksList from './BookmarksList';
import styles from './styles/Persons.module.css';

interface Props {
  persons: IPerson[];
  onLinkOpen: (url: string) => void;
  scrollButton?: boolean;
  bookmarkListProps: { fullscreen: boolean };
  renderPerson: (person: IPerson) => ReactNode;
}

type InnerProps = Props & {
  bodyWidth: number;
  bodyRef: MutableRefObject<HTMLDivElement>;
  personToOpen: IPerson | null;
  personToOpenImage: string;
};

const PersonsInner = ({
  persons,
  onLinkOpen,
  scrollButton = false,
  bookmarkListProps,
  bodyWidth,
  bodyRef,
  personToOpen,
  personToOpenImage,
  renderPerson,
}: InnerProps) => {
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
      <Box h={rowVirtualizer.getTotalSize()} w="100%" pos="relative">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Flex
            key={virtualRow.key}
            pos="absolute"
            top={0}
            left={0}
            w="100%"
            h={virtualRow.size}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {Array(columnCount)
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
                  <Box key={person.uid} w={columnDimension}>
                    {renderPerson(person)}
                  </Box>
                );
              })}
          </Flex>
        ))}
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
};

const Persons = memo<Props>(function Persons(props) {
  const { persons } = props;
  const [personToOpen, setPersonToOpen] = useState<IPerson | null>(null);
  const [personToOpenImage, setPersonToOpenImage] = useState('');
  const { ref, width } = useElementSize();
  const { location } = useContext(DynamicContext);
  const queryString = location.query();
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

  return (
    <Box ref={ref} className={styles.personInner} w="100%" h="100%">
      {width > 0 && (
        <PersonsInner
          {...props}
          bodyWidth={width}
          bodyRef={ref}
          personToOpen={personToOpen}
          personToOpenImage={personToOpenImage}
        />
      )}
    </Box>
  );
});

export default Persons;
