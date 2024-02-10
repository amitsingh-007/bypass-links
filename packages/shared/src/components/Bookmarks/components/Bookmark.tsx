import { Anchor, Flex, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { memo, useCallback, useEffect, useState } from 'react';
import usePlatform from '../../../hooks/usePlatform';
import usePerson from '../../Persons/hooks/usePerson';
import { IPerson, IPersonWithImage } from '../../Persons/interfaces/persons';
import Favicon from './Favicon';
import PersonAvatars from './PersonAvatars';
import styles from './styles/Bookmark.module.css';

export interface BookmarkProps {
  url: string;
  title: string;
  taggedPersons: string[];
  pos?: number;
  isSelected?: boolean;
  handleSelectedChange?: (pos: number, isOnlySelection: boolean) => void;
  onOpenLink: (url: string) => void;
}

const getPersonsFromUids = async (uids: string[], persons: IPerson[]) => {
  if (!uids || !persons) {
    return [];
  }
  return persons.filter((person) => uids.includes(person.uid ?? ''));
};

const Bookmark = memo<BookmarkProps>(function Bookmark({
  url,
  title,
  pos = 0,
  taggedPersons,
  isSelected,
  handleSelectedChange,
  onOpenLink,
}) {
  const contextId = md5(url);
  const [personsWithImageUrls, setPersonsWithImageUrls] = useState<
    IPersonWithImage[]
  >([]);
  const { getAllDecodedPersons, getPersonsWithImageUrl } = usePerson();
  const isMobile = usePlatform();

  const initImageUrl = useCallback(async () => {
    const allPersons = await getAllDecodedPersons();
    const persons = await getPersonsFromUids(taggedPersons, allPersons);
    const newPersonsWithImageUrls = await getPersonsWithImageUrl(persons);
    setPersonsWithImageUrls(newPersonsWithImageUrls);
  }, [getAllDecodedPersons, getPersonsWithImageUrl, taggedPersons]);

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
    <Flex
      w="100%"
      h="100%"
      align="center"
      gap="0.75rem"
      px="0.375rem"
      onDoubleClick={handleOpenLink}
      onClick={handleSelectionChange}
      onContextMenu={onRightClick}
      data-context-id={contextId}
    >
      <Tooltip
        label={url}
        color="violet.5"
        position="right"
        withArrow
        arrowSize={6}
        multiline
        className={styles.tooltip}
        w="40%"
        lh="1.3"
        transitionProps={{
          transition: 'pop',
          duration: 300,
        }}
      >
        <Favicon url={url} />
      </Tooltip>
      <PersonAvatars persons={personsWithImageUrls} />
      <Text
        size="0.9375rem"
        lineClamp={1}
        data-context-id={contextId}
        className={styles.tooltipTextWrapper}
      >
        {isMobile ? (
          <Anchor href={url} display="block" className={styles.tooltipText}>
            {title}
          </Anchor>
        ) : (
          title
        )}
      </Text>
    </Flex>
  );
});

export default Bookmark;
