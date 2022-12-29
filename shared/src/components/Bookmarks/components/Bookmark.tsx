import { Flex, Text, Tooltip } from '@mantine/core';
import md5 from 'md5';
import { memo, useCallback, useEffect, useState } from 'react';
import usePerson from '../../Persons/hooks/usePerson';
import { IPerson, IPersonWithImage } from '../../Persons/interfaces/persons';
import Favicon from './Favicon';
import PersonAvatars from './PersonAvatars';

export interface Props {
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

const Bookmark = memo<Props>(function Bookmark({
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
      gap={12}
      px={6}
      onDoubleClick={handleOpenLink}
      onClick={handleSelectionChange}
      onContextMenu={onRightClick}
      data-context-id={contextId}
    >
      <Tooltip
        label={url}
        color="indigo"
        position="right"
        withArrow
        arrowSize={6}
        multiline
        sx={{ wordWrap: 'break-word' }}
        w="40%"
        lh="1.3"
        transition="pop"
        transitionDuration={300}
      >
        <Favicon url={url} />
      </Tooltip>
      <PersonAvatars persons={personsWithImageUrls} />
      <Text
        size={15}
        lineClamp={1}
        data-context-id={contextId}
        sx={{ flex: 1 }}
      >
        {title}
      </Text>
    </Flex>
  );
});

export default Bookmark;
